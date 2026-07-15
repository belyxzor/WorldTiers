import React from 'react';
export function EmptyState({title='Aucun résultat',text='Essaie une autre recherche.'}){return <div className="empty-state"><span>⌕</span><h3>{title}</h3><p>{text}</p></div>}
