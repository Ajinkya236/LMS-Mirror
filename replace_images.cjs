const fs = require('fs');
const path = require('path');

const coursePhotos = [
  '1516321318423-f06f85e504b3', // laptop/desk
  '1524178232363-1fb2b075b655', // classroom
  '1501504905252-473c47e087f8', // books
  '1434030216411-0b793f4b4173', // notebook
  '1531482615713-2afd69097998', // meeting
  '1522202176988-66273c2fd55f', // students
  '1552664730-d307ca884978', // training
  '1542744173-8e7e53415bb0', // office
  '1454165804606-c3d57bc86b40', // desk
  '1513258496099-48162023ac90', // team
  '1517245386807-bb43f82c33c4', // whiteboard
  '1523240795612-9a054b0db644', // books
  '1503676260728-1c00da094a0b', // school
  '1427504494785-3a9a2e443ee4', // library
  '1497032205566-5089c1a73938', // macbook
  '1581091226825-a6a2a5aee158', // video call
  '1573164713988-8665fc963095', // tech
  '1504384308090-c894fdcc538d', // coding
  '1553877522-435f05697254', // presentation
  '1540569014015-19a7be504e3a', // data/charts
];

const peoplePhotos = [
  '1573496359142-b8d87734a5a2', // professional woman
  '1560250097-0b93528c311a', // professional man
  '1573497019940-1c28c88b4f3e', // professional woman
  '1519085360753-af0119f7cbe7', // professional woman
  '1507003211169-0a1dd7228f2d', // professional man
  '1500648767791-00dcc994a43e', // professional man
  '1580489944761-15a19d654956', // professional woman
  '1506794778202-cad84cf45f1d', // professional man
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const regex = /https:\/\/picsum\.photos\/(seed|id)\/([^/]+)\/(\d+)\/(\d+)/g;
  
  content = content.replace(regex, (match, type, seedOrId, width, height) => {
    modified = true;
    const isPerson = parseInt(width) <= 200 && parseInt(width) === parseInt(height);
    
    const pool = isPerson ? peoplePhotos : coursePhotos;
    const index = hashString(seedOrId) % pool.length;
    const photoId = pool[index];
    
    return "https://images.unsplash.com/photo-" + photoId + "?w=" + width + "&h=" + height + "&fit=crop&q=80";
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated " + filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir('./pages');
walkDir('./components');
if (fs.existsSync('./src')) {
  walkDir('./src');
}
