import vanillaIcon from '../assets/modes/vanilla.png';import swordIcon from '../assets/modes/sword.png';import uhcIcon from '../assets/modes/uhc.png';import nethpotIcon from '../assets/modes/nethpot.png';import potIcon from '../assets/modes/pot.png';import smpIcon from '../assets/modes/smp.png';import axeIcon from '../assets/modes/axe.png';import diasmpIcon from '../assets/modes/diasmp.png';import maceIcon from '../assets/modes/mace.png';import spearMaceIcon from '../assets/modes/spear-mace.png';
export const MODES=[
 {id:'crystal',name:'Vanilla',icon:vanillaIcon,color:'#c68cff',description:'Crystal PvP moderne'},
 {id:'sword',name:'Sword',icon:swordIcon,color:'#65d6ff',description:'Combat à l’épée'},
 {id:'uhc',name:'UHC',icon:uhcIcon,color:'#ff6072',description:'UHC avec soins limités'},
 {id:'nethpot',name:'Neth Pot',icon:nethpotIcon,color:'#c18ce5',description:'Netherite et potions'},
 {id:'pot',name:'Pot',icon:potIcon,color:'#ffb5c4',description:'Diamond potion PvP'},
 {id:'smp',name:'SMP',icon:smpIcon,color:'#37d0ad',description:'Kit SMP complet'},
 {id:'axe',name:'Axe',icon:axeIcon,color:'#66c8ef',description:'Shield & Axe'},
 {id:'diasmp',name:'Dia SMP',icon:diasmpIcon,color:'#d997e4',description:'SMP diamant'},
 {id:'mace',name:'Mace',icon:maceIcon,color:'#adb0bf',description:'Combat à la masse'},
 {id:'spear-mace',name:'Spear Mace',icon:spearMaceIcon,color:'#67dfe3',description:'Lance et masse'}
];
export const getMode=id=>MODES.find(m=>m.id===id);
