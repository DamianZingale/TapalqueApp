import type { Imenu } from '../types/Imenu'

export const useOrederMenuByCategory = (items : Imenu[]) => {

    return items.reduce((acc, item) =>{
        if (!acc[item.category]){
            acc[item.category] = []
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, Imenu[]>)
    
  
}
