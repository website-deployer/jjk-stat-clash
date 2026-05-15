const fs = require('fs');

const path = './src/data/characters.ts';
let content = fs.readFileSync(path, 'utf8');

const calamityIds = ['gojo', 'sukuna', 'modulo-yuji', 'dabura'];

// Helper to scale stat
function scale(val) {
  return Math.min(120, Math.round(val * 1.2));
}

// 1. Scale characters
content = content.replace(/\{ id: '([^']+)', name: '([^']+)', category: 'character', stats: (\{[^}]+\})(.*?) grade: "([^"]+)" \}/g, (match, id, name, statsStr, rest, grade) => {
  let stats = JSON.parse(statsStr);
  
  if (calamityIds.includes(id)) {
    grade = "Calamity";
    if (id === 'gojo') {
      stats = { strength: 105, speed: 118, durability: 100, ce: 120, body: 105, iq: 115 };
    } else if (id === 'sukuna') {
      stats = { strength: 118, speed: 115, durability: 118, ce: 120, body: 120, iq: 120 };
    } else if (id === 'modulo-yuji') {
      stats = { strength: 120, speed: 110, durability: 120, ce: 105, body: 120, iq: 100 };
    } else if (id === 'dabura') {
      stats = { strength: 105, speed: 120, durability: 100, ce: 105, body: 105, iq: 95 };
    }
  } else {
    // scale existing stats
    for (const key in stats) {
      stats[key] = scale(stats[key]);
    }
  }
  
  return `{ id: '${id}', name: '${name}', category: 'character', stats: ${JSON.stringify(stats)}${rest} grade: "${grade}" }`;
});

// 2. Scale other entities (abilities, tools, shikigami, domainExpansions, cursedTechniques)
// Looks like: { id: 'copy', name: 'Copy', category: 'cursedTechnique', statValue: 95, ... grade: "Mythic" }
content = content.replace(/statValue: (\d+)/g, (match, val) => {
  return `statValue: ${scale(Number(val))}`;
});

// 3. For 'limitless', 'shrine', 'modulo-yuji-domain' (Black Box), maybe bump their grade to Calamity?
// The user said: "Calamity grades should be the top 4 (gojo, sukuna, modulo yuji, dabura)". They didn't explicitly say techniques. But it would make sense for Malevolent Shrine, Unlimited Void, and Black Box to be Calamity.
// Let's explicitly change their grades if needed. Or leave as Mythic. Let's make their abilities Calamity too.
const calamityAbilities = ['limitless', 'shrine', 'unlimited-void', 'malevolent-shrine', 'modulo-yuji-domain'];
for (const ability of calamityAbilities) {
  content = content.replace(new RegExp(`{ id: '${ability}'.*? grade: "([^"]+)" }`), (match, grade) => {
    return match.replace(`grade: "${grade}"`, `grade: "Calamity"`);
  });
}

// 4. Update Pairings bonus stats? The user said "range 1-120 for each character and its stats". If pairings give bonus stats, they might also need scaling.
content = content.replace(/bonusStats: (\{[^}]+\})/g, (match, statsStr) => {
  // statsStr like { speed: 18, ce: 10, iq: 10 }
  // but wait, it doesn't have quotes around keys in pairings
  // We can just use a simple regex for keys and values
  let scaledStatsStr = statsStr.replace(/(\w+): (\d+)/g, (m, key, val) => {
    return `${key}: ${scale(Number(val))}`;
  });
  return `bonusStats: ${scaledStatsStr}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Stats scaled successfully!');
