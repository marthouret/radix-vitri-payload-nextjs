export function extractPlainTextFromLexical(lexicalContent: any, maxLength: number = 120): string {
  if (!lexicalContent || !lexicalContent.root || !lexicalContent.root.children || lexicalContent.root.children.length === 0) {
    return 'Description à venir.';
  }
  let text = '';
  function recurseNodes(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'text') {
        text += node.text;
      }
      if (node.children) {
        recurseNodes(node.children);
      }
      if (node.type === 'paragraph' || node.type === 'listitem' || node.type === 'linebreak') {
        if (text.length > 0 && !text.endsWith(' ')) {
          text += ' ';
        }
      }
    }
  }
  recurseNodes(lexicalContent.root.children);
  const cleanedText = text.replace(/\s\s+/g, ' ').trim();
  if (cleanedText.length > maxLength) {
    return cleanedText.substring(0, maxLength - 3) + '...';
  }
  return cleanedText || 'Description à venir.';
}