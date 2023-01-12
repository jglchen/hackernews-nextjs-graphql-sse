import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import  secureLocalStorage  from  "react-secure-storage";
import { AUTH_TOKEN } from '@/lib/constants';

const Header = () => {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = secureLocalStorage.getItem(AUTH_TOKEN) as string;
    if (token){
      setAuthToken(token);
    }
  }, []);

  async function logOut(){
    secureLocalStorage.removeItem(AUTH_TOKEN);
    router.reload();
    router.push('/new/1');
  }  

  return (
    <>
    <div className="flex pa1 justify-between nowrap orange">
    <div className="flex flex-fixed black">
      <Link href="/" className="no-underline black">
        <div className="fw7 mr1">Hacker News</div>
      </Link>           
      <Link href="/new/1" className="ml1 no-underline black">
        new
      </Link>
      <div className="ml1 mr1">|</div>
      <Link href="/top" className="ml1 no-underline black">
         top
      </Link>
      <div className="ml1 mr1">|</div>
      <Link href="/search" className="ml1 no-underline black">
        search
      </Link>
      {authToken && (
        <div className="flex">
          <div className="ml1 mr1">|</div>
          <Link
            href="/create"
            className="ml1 no-underline black"
          >
            submit
          </Link>
        </div>
      )}
      <div className="ml1 mr1">|</div>
      <Link href="/about" className="ml1 no-underline black">
        about
      </Link>
    </div>
    <div className="flex flex-fixed black">
      {authToken ? (
        <div
          className="ml1 pointer black"
          onClick={() => logOut()}
        >
          logout
        </div>
      ) : (
        <Link
          href="/login"
          className="ml1 no-underline black"
        >
          login
        </Link>
      )}
    </div>
  </div>
  <div className="pv2 ph3" style={{textAlign: 'right'}}>
     React Native Expo Publish: <a  className="blue" href="https://exp.host/@jglchen/hackernews-apollo" target="_blank" rel="noreferrer">https://exp.host/@jglchen/hackernews-apollo</a>
  </div>
  </>
  );
};

export default Header;
