import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

type PrivateRouteProps = {
    children: ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps) =>{
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);
    if(!isAuthenticated){
        return <Navigate to="/login" replace={true} /> 
    }
    return(
        <>
            {children}
        </>
    )
}
export default PrivateRoute;