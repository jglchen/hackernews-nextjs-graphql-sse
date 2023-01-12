import Header from './Header';

export default function Layout({ children }: {children: JSX.Element}) {
    return (
      <div className="center layoutwidth">
        <Header />
        <div className="ph3 pv1 background-gray">
            {children}
        </div>
     </div>   
    );

}    
