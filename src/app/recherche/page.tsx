// src/app/recherche/page.tsx
import React from 'react'
import type {
  Verrier as VerrierType,
  Engagement,
  FonctionsVerrier,
  FonctionsPersonnalite,
  Verrery as VerrerieTypeAPI,
} from '@/payload-types'
import PersonneCard from '@/components/PersonneCard'
import { formatPeriode } from '@/utils/formatters'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Ce type nous aide à travailler avec les données enrichies
type VerrierAvecEngagements = VerrierType & {
  engagements: Partial<Engagement>[]
}

async function getSearchResults(query: string): Promise<VerrierAvecEngagements[]> {
  if (!query) return []
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Trouver les personnes dont le nom correspond
    const { docs: matchedPeople } = await payload.find({
      collection: 'verriers',
      where: {
        nomComplet: { like: query }, // 'like' est insensible à la casse avec PostgreSQL
      },
      limit: 50,
      depth: 0, // On récupère les IDs, on enrichira après
    })

    if (matchedPeople.length === 0) return []
    const peopleIds = matchedPeople.map((p) => p.id)

    // 2. Trouver tous les engagements liés à ces personnes
    const { docs: allEngagements } = await payload.find({
      collection: 'engagements',
      where: { personneConcernee: { in: peopleIds } },
      depth: 2, // Pour avoir les fonctions et les verreries
      limit: 200,
    })

    // 3. Trouver toutes les verreries fondées par ces personnes
    const { docs: allVerreriesFounded } = await payload.find({
      collection: 'verreries',
      where: { fondateurs: { in: peopleIds } },
      depth: 1, // Pour avoir les infos de la verrerie
      limit: 100,
    })

    // 4. On assemble le tout
    const finalResults = matchedPeople.map((personne) => {
      // Les vrais engagements de la personne
      const realEngagements = allEngagements.filter(
        (eng) => (eng.personneConcernee as VerrierType)?.id === personne.id,
      )

      // Les "engagements factices" pour les fondateurs
      const founderEngagements = allVerreriesFounded
        .filter((v) =>
          v.fondateurs?.some((f) => (typeof f === 'object' ? f.id : f) === personne.id),
        )
        .map((v) => {
          const anneeFondation =
            v.periodeVerriere?.anneeDebutSort || v.periodeVerriere?.anneeFondationApprox || null
          const dateDebut = anneeFondation
            ? { anneeDebutSort: anneeFondation, typePrecisionDateDebut: 'AnneeSeuleExacte' }
            : undefined

          return {
            id: Number(`999${v.id}`), // ou undefined si tu ne l’utilises pas
            typeEngagement: 'role_personnalite',
            fonctionPersonnalite: { nom: 'Fondateur' } as any,
            verrerie: v,
            personneConcernee: personne.id,
            dateDebutStructurée: dateDebut,
          } as Partial<Engagement>
        })

      return {
        ...personne,
        engagements: [...realEngagements, ...founderEngagements],
      }
    })

    return finalResults
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    return []
  }
}

// Le composant de la page, qui utilise la logique ci-dessus
export default async function SearchPage({ searchParams }: { searchParams?: any }) {
  const queryParam = searchParams?.q
  const query = Array.isArray(queryParam) ? (queryParam[0] ?? '') : (queryParam ?? '')
  const personnesTrouvees = await getSearchResults(query)

  // Le reste de la page (tri, transformation, JSX) ne change pas,
  // car nous lui fournissons maintenant les données complètes qu'elle attendait.
  const personnalites: VerrierAvecEngagements[] = []
  const verriers: VerrierAvecEngagements[] = []

  if (personnesTrouvees) {
    // Tri des engagements pour chaque personne
    personnesTrouvees.forEach((personne) => {
      if (Array.isArray(personne.engagements)) {
        personne.engagements.sort((a, b) => {
          const anneeA = a.dateDebutStructurée?.anneeDebutSort ?? 9999
          const anneeB = b.dateDebutStructurée?.anneeDebutSort ?? 9999
          if (anneeA !== anneeB) return anneeA - anneeB
          const moisA = a.dateDebutStructurée?.moisDebutSort ?? 13
          const moisB = b.dateDebutStructurée?.moisDebutSort ?? 13
          return moisA - moisB
        })
      }
    })

    // Tri des personnes en deux groupes
    personnesTrouvees.forEach((personne) => {
      const hasPersonalityRole =
        Array.isArray(personne.engagements) &&
        personne.engagements.some((eng) => eng.typeEngagement === 'role_personnalite')
      if (hasPersonalityRole) {
        personnalites.push(personne)
      } else {
        verriers.push(personne)
      }
    })
  }

  // Fonction utilitaire pour transformer les données pour le composant PersonneCard
  const transformerEngagements = (engagements?: Partial<Engagement>[]) => {
    if (!engagements) return []
    return engagements.map((eng) => {
      const fonction = (
        eng.typeEngagement === 'metier_verrier' ? eng.fonctionVerrier : eng.fonctionPersonnalite
      ) as FonctionsVerrier | FonctionsPersonnalite
      const verrerie = eng.verrerie as VerrerieTypeAPI
      return {
        engagementId: (eng.id ?? '').toString(),
        fonction: typeof fonction === 'object' ? fonction?.nom : undefined,
        periode: formatPeriode(eng.dateDebutStructurée, eng.dateFinStructurée),
        verrerieNom: typeof verrerie === 'object' ? verrerie?.nomPrincipal : undefined,
        verrerieSlug: typeof verrerie === 'object' ? verrerie?.slug : undefined,
      }
    })
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-serif mb-10 text-center">
          Résultats de la recherche pour : <span className="text-gold">&quot;{query}&quot;</span>
        </h1>

        {personnesTrouvees.length === 0 ? (
          <p className="text-center text-blueGray-600">
            Aucun résultat trouvé pour votre recherche.
          </p>
        ) : (
          <div className="space-y-12">
            {personnalites.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif border-b pb-2">
                  Personnalités Clés <span className="text-gold">({personnalites.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {personnalites.map((p) => (
                    <PersonneCard
                      key={p.id}
                      personne={p}
                      engagements={transformerEngagements(p.engagements)}
                    />
                  ))}
                </div>
              </section>
            )}
            {verriers.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif border-b pb-2">
                  Verriers <span className="text-gold">({verriers.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {verriers.map((v) => (
                    <PersonneCard
                      key={v.id}
                      personne={v}
                      engagements={transformerEngagements(v.engagements)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
