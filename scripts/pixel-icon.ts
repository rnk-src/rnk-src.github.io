// Prints the <svg> markup for a shared pixel icon, for pasting into a demo.
// Usage: node scripts/pixel-icon.ts <name> [class]
import { icons, toSvg, type IconName } from '../src/icons/pixel-icons.ts';

const [name, className] = process.argv.slice(2);
if (!(name in icons)) {
  console.error(
    `Usage: node scripts/pixel-icon.ts <${Object.keys(icons).join('|')}> [class]`,
  );
  process.exit(1);
}
console.log(toSvg(name as IconName, className));
