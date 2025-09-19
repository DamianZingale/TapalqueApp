import React, { useState } from 'react'




export const ItemCounter = () => {
    const [count, setCount] = useState(0);

    const handleAdd = ()=> setCount(count + 1);

    const handleSubstract = ()=>{
        if(count === 0) return;
        setCount(count - 1);
    }
  return (
    <section 
    className='item-row'>
    <button className="btn btn-outline-secondary" onClick={handleSubstract}>-1</button>
    <span className="mx-3"style = {{ color: count === 0 ? 'gray' : 'black'}}
    >{count}
    </span>
    <button className="btn btn-outline-secondary" onClick={handleAdd}>+1</button>
    </section>
  )
}
