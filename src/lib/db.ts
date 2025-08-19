import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

export default function db<T extends object>() {
  return new PouchDB<T>('ramit2');
}
