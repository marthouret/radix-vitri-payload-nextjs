import { NextResponse } from 'next/server';
import type { Endpoint, PayloadHandler } from 'payload';
import type { Verrier, Engagement } from '@/payload-types';

const recherchePersonnesHandler: PayloadHandler = async (req) => {
  const { payload, query } = req;
  const searchTerm = query.q as string;

  if (!searchTerm || typeof searchTerm !== 'string') {
    return NextResponse.json({ error: 'Le terme de recherche est manquant ou invalide.' }, { status: 400 });
  }

  const verreriesFondateurMap = new Map<string, any[]>();

  try {
    // 1. Trouver les verriers correspondant au terme
    const verriersQuery = await payload.find({
      collection: 'verriers',
      where: { nomComplet: { like: searchTerm } },
      depth: 0,
      limit: 100,
    });
    // console.log('Verriers trouvés:', verriersQuery.docs);
    const verrierIds = verriersQuery.docs.map(v => v.id);

    // 2. Trouver les engagements où personneConcernee est dans ces IDs
    const personnesMap = new Map<string, Verrier>();
    let engagements: Engagement[] = [];
    if (verrierIds.length > 0) {
      const engagementsQuery = await payload.find({
        collection: 'engagements',
        where: { personneConcernee: { in: verrierIds } },
        depth: 1,
        limit: 200,
      });
      engagements = engagementsQuery.docs;
      engagements.forEach(eng => {
        if (typeof eng.personneConcernee === 'object' && eng.personneConcernee?.id) {
          personnesMap.set(eng.personneConcernee.id.toString(), eng.personneConcernee);
        }
      });
    }
    // console.log('Engagements trouvés:', engagements.length);

    // 3. Trouver les verreries où fondateurs contient un de ces IDs
    if (verrierIds.length > 0) {
    const verreriesQuery = await payload.find({
        collection: 'verreries',
        where: { fondateurs: { in: verrierIds } },
        depth: 1, // depth=1 est ok si periodeVerriere n'est pas une relation
        limit: 100,
    });

    verreriesQuery.docs.forEach(verrerie => {
        if (Array.isArray(verrerie.fondateurs)) {
          verrerie.fondateurs.forEach((fondateur: number | Verrier) => {
            const fondateurId = (typeof fondateur === 'object' ? fondateur.id : fondateur).toString();
            if (!verreriesFondateurMap.has(fondateurId)) {
              verreriesFondateurMap.set(fondateurId, []);
            }

            // Logique de date : la date d'un engagement de fondateur est déduite de la date de début ou de création de la verrerie.
            let dateDebut; // Notre objet date final

            // Priorité 1 : On utilise les données structurées de periodeVerriere si elles existent
            if (verrerie.periodeVerriere && verrerie.periodeVerriere.anneeDebutSort) {
              dateDebut = {
                anneeDebutSort: verrerie.periodeVerriere.anneeDebutSort,
                moisDebutSort: verrerie.periodeVerriere.moisDebutSort,
                typePrecisionDateDebut: verrerie.periodeVerriere.typePrecisionDateDebut,
              };
            }
            // Priorité 2 : Sinon, on se rabat sur l'année approximative
            else if (verrerie.periodeVerriere?.anneeFondationApprox) {
              dateDebut = {
                anneeDebutSort: verrerie.periodeVerriere.anneeFondationApprox,
                typePrecisionDateDebut: 'CircaAnnee', // On suppose que c'est une approximation
              };
            }
            // Priorité 3 : On pourrait même vérifier dateDeCreation.datePreciseCreation ici
            // ...
            else {
              dateDebut = undefined; // Aucune date trouvée
            }
            
            verreriesFondateurMap.get(fondateurId)!.push({
              verrerie: { id: verrerie.id, nomPrincipal: verrerie.nomPrincipal, slug: verrerie.slug },
              dateDebutStructurée: dateDebut,
            });
          });
        }
      });
    }

    const uniquePeople = Array.from(personnesMap.values());
    console.log('Personnes uniques trouvées:', uniquePeople);

    // 4. Enrichir chaque personne avec ses engagements (y compris ceux de fondateurs de verreries)
    const finalResults = await Promise.all(
        uniquePeople.map(async (personne) => {
            const { docs: allEngagementsForPerson } = await payload.find({
            collection: 'engagements',
            where: { personneConcernee: { equals: personne.id.toString() } },
            depth: 2,
            limit: 100,
        });

        // Récupère les verreries fondées par cette personne
        console.log('verreriesFondateurMap:', verreriesFondateurMap);
        const fondateurDe = verreriesFondateurMap.get(personne.id.toString()) || [];

        // On ajoute les engagements synthétiques "fondateur" à la liste des engagements de la personne
        const engagementsFondateur = fondateurDe.map(v => ({
            id: `fondateur-${v.verrerie.id}`,
            typeEngagement: 'role_personnalite',
            fonctionPersonnalite: { nom: 'Fondateur' }, // Simplifié
            verrerie: v.verrerie,
            
            // On utilise directement l'objet qu'on a préparé
            dateDebutStructurée: v.dateDebutStructurée,
            dateFinStructurée: undefined, // Pas de date de fin pour un fondateur
            
            // On met les autres champs à null pour la cohérence des types
            fonctionVerrier: null,
            periodeActiviteTexte: null,
            descriptionEngagement: null,
            personneConcernee: personne,
            createdAt: '', // Mettre une chaîne vide ou une date valide si nécessaire
            updatedAt: '',
        }));
        
        // On concatène les vrais engagements et les engagements "fondateur"
        return {
            ...personne,
            engagements: [...allEngagementsForPerson, ...engagementsFondateur],
        };
    })
    );

    console.log('finalResults:', finalResults);

    return NextResponse.json({ docs: finalResults }, { status: 200 });

  } catch (error) {
    console.error("Erreur dans l'endpoint de recherche:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
};

export const recherchePersonnesEndpoint: Endpoint = {
  path: '/custom/recherche-personnes',
  method: 'get',
  handler: recherchePersonnesHandler,
};