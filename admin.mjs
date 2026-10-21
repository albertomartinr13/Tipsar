import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';
const db=new DatabaseSync(fileURLToPath(new URL('./data/tipsar.sqlite',import.meta.url)));
const email=process.argv[2];if(!email)throw Error('Uso: npm run admin -- tu-correo');
const state=JSON.parse(db.prepare('SELECT body FROM state WHERE id=1').get().body),user=state.users.find(u=>u.email===email&&!u.deleted);
if(!user)throw Error('Registra tu cuenta primero. Detén el servidor antes de ejecutar este comando.');user.role='admin';db.prepare('UPDATE state SET body=? WHERE id=1').run(JSON.stringify(state));db.close();console.log('Administrador asignado. Reinicia Tipsar.');
