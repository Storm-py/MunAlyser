import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'

export default function Protected({children, authentication = true}) {

    const navigate = useNavigate()
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        
        if(authentication && authStatus !== authentication){
            navigate("/login")
        } 
        else if(!authentication && authStatus !== authentication){
            navigate("/")
        }
    }, [authStatus, navigate, authentication])
    
    if (authentication && authStatus !== authentication) return null;
    if (!authentication && authStatus !== authentication) return null;

    return <>{children}</>
}