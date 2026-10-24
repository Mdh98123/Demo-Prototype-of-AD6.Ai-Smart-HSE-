const fs = require('fs');
let content = fs.readFileSync('components/InspectionModule.tsx', 'utf8');

const target = `  const handleFindNearby = () => {
      setIsLocating(true);
      setLocationError(null);
      if (!navigator.geolocation) {`;
      
const replacement = `  const handleFindNearby = () => {
      if (userLocation) {
          setUserLocation(null);
          return;
      }
      setIsLocating(true);
      setLocationError(null);
      if (!navigator.geolocation) {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('components/InspectionModule.tsx', content);
    console.log('Fixed handleFindNearby toggle');
} else {
    console.log('Could not find target');
}
