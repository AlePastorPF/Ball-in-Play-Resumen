import path from 'node:path';
import ExcelJS from 'exceljs';
import {readFile} from 'node:fs/promises';
export const SHEET='Datos consolidados';
export const HEADERS=['Session Start Date','Event','Session Name','Session Start','Session End','Tag Description','Tag Notes','Tag Start','Tag End','Tag Duration (secs)','Partido','Resultado ','Rueda','Etapa'];
export const FIELDS=['date','event','round','sessionStart','sessionEnd','description','notes','start','end','duration','rival','result','leg','stage'];
export async function parseBook(bytes){const wb=new ExcelJS.Workbook();await wb.xlsx.load(bytes);const ws=wb.getWorksheet(SHEET);if(!ws)throw Error('No se encontró la hoja «'+SHEET+'»');for(let i=0;i<HEADERS.length;i++){if(String(ws.getRow(1).getCell(i+1).value??'').trim()!==HEADERS[i].trim())throw Error('Formato inesperado en columna '+(i+1))}return {wb,ws}}
function getVal(cell){const v=cell.value;if(v instanceof Date){return `${v.getFullYear()}/${String(v.getMonth()+1).padStart(2,'0')}/${String(v.getDate()).padStart(2,'0')}`}if(v&&typeof v==='object'){if(v.text)return String(v.text);if(v.result!==undefined)return v.result}return v??''}
export function extract(ws){const rows=[];for(let i=2;i<=ws.rowCount;i++){const r=ws.getRow(i);if(!r.hasValues)continue;const obj={id:i};FIELDS.forEach((f,j)=>obj[f]=getVal(r.getCell(j+1)));rows.push(obj)}return rows}
export function asSeconds(v){if(typeof v==='number')return v;const s=String(v??'').trim().replace(',','.');if(!s)return NaN;if(/^\d+(?:\.\d+)?$/.test(s))return Number(s);if(/^\d+:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(s)){const p=s.split(':').map(Number);return p.reduce((a,n)=>a*60+n,0)}return NaN}
const editable=['date','event','round','sessionStart','sessionEnd','description','notes','start','end','duration','rival','result','leg','stage'];
export function clean(input){const obj={};for(const f of editable){let value=input?.[f]??'';if(f==='duration'){value=asSeconds(value);if(!Number.isFinite(value)||value<0||value>3600)throw Error('Duración inválida (0–3600 segundos)')}else{value=String(value).trim().slice(0,200)}obj[f]=value}if(!obj.date||!obj.round||!obj.rival)throw Error('Fecha, jornada y rival son obligatorios');if(!/^\d{4}[\/-]\d{2}[\/-]\d{2}$/.test(obj.date))throw Error('La fecha debe estar en AAAA/MM/DD');return obj}
export function applyChanges(ws,ops){if(!Array.isArray(ops)||ops.length!==1)throw Error('Se admite una operación por guardado');const op=ops[0];if(op.type==='update'){const i=Number(op.id);if(!Number.isInteger(i)||i<2||i>ws.rowCount||!ws.getRow(i).hasValues)throw Error('Fila inexistente');const obj=clean(op.row);FIELDS.forEach((f,j)=>{ws.getRow(i).getCell(j+1).value=obj[f]});return `Actualizar secuencia fila ${i}`}
if(op.type==='add'){const obj=clean(op.row);const r=ws.addRow(FIELDS.map(f=>obj[f]));r.getCell(10).numFmt='0.000';return `Agregar secuencia ${obj.round} ${obj.rival}`}
if(op.type==='delete'){const i=Number(op.id);if(!Number.isInteger(i)||i<2||i>ws.rowCount||!ws.getRow(i).hasValues)throw Error('Fila inexistente');ws.spliceRows(i,1);return `Eliminar secuencia fila ${i}`}
throw Error('Operación desconocida')}
export async function localBytes(){return readFile(path.join(process.cwd(), 'data', 'BiP_Full_25_26.xlsx'))}
