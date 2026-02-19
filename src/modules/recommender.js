/**
 * getRecommendations
 * Called by GET /api/novels/:id/recommendations
 *
 * @param {Object} currentNovel  - the novel being viewed
 * @param {Array}  allNovels     - full list of novels from DB
 * @returns {Array}              - up to 5 recommended novels
 *
 * Priority:
 *  1. Same author, sorted by read desc
 *  2. Genre match (1pt) + each matching tag (1pt each), sorted by score then read desc
 */
export function getRecommendations(currentNovel, allNovels) {
  const currentId = String(currentNovel.id ?? currentNovel._id);

  const currentTags = ['tag1', 'tag2', 'tag3']
    .map(k => (currentNovel[k] || '').toString().trim())
    .filter(Boolean);

  const results = [];
  const addedIds = new Set([String(currentId)]);

  const getId = n => String(n.id ?? n._id);

  const add = n => {
    const id = getId(n);
    if (addedIds.has(id)) return;
    addedIds.add(id);
    results.push(n);
  };

  // Step 1: same author, sorted by read desc
  allNovels
    .filter(n => getId(n) !== String(currentId) && n.author === currentNovel.author)
    .sort((a, b) => (b.read || 0) - (a.read || 0))
    .forEach(add);

  // Step 2: genre + tag overlap scoring
  // genre = 0.4, each tag = 0.2 (tag1/tag2/tag3 each worth 20%)
  allNovels
    .filter(n => !addedIds.has(getId(n)))
    .map(n => {
      let score = 0;
      if (n.genre && n.genre === currentNovel.genre) score += 0.4;
      ['tag1', 'tag2', 'tag3'].forEach(k => {
        const v = (n[k] || '').toString().trim();
        if (v && currentTags.includes(v)) score += 0.2;
      });
      return { novel: n, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (b.novel.read || 0) - (a.novel.read || 0))
    .forEach(({ novel }) => add(novel));

  return results.slice(0, 5);
}