const fs = require('fs');
let content = fs.readFileSync('components/App.tsx', 'utf8');

content = content.replace(/import \{ GISMapModule \} from '\.\/GISMapModule';/, "const GISMapModule = React.lazy(() => import('./GISMapModule').then(m => ({ default: m.GISMapModule })));");

fs.writeFileSync('components/App.tsx', content);
