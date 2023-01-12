import { useState, useEffect, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import  secureLocalStorage  from  "react-secure-storage";
import { AUTH_TOKEN } from '@/lib/constants';
import loaderStyles from '@/styles/loader.module.css';

const SIGNUP_MUTATION = gql`
  mutation SignupMutation(
    $email: String!
    $password: String!
    $name: String!
  ) {
    signup(
      email: $email
      password: $password
      name: $name
    ) {
      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation(
    $email: String!
    $password: String!
  ) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

const Login = () => {
  const router = useRouter();
  const [formState, setFormState] = useState({
    login: true,
    email: '',
    password: '',
    name: ''
  });
  const [inputErr, setInputErr] = useState('');
  const [passwdInputStr, setPasswdInputStr] = useState('Please type password');
  const nameEl = useRef<HTMLInputElement | null>(null);
  const emailEl = useRef<HTMLInputElement | null>(null);
  const pwdEl = useRef<HTMLInputElement | null>(null);

  const [login, {data: loginData, loading: loginLoading, error: loginError}] = useMutation(LOGIN_MUTATION, {
    variables: {
      email: formState.email,
      password: formState.password
    },
    onCompleted: ({ login }) => {
      secureLocalStorage.setItem(AUTH_TOKEN, login.token);
      router.push('/new/1');
    },
    onError: (err) => {
      //console.log(err);
    }
  });
  
  const [signup, {data: signupData, loading: signupLoading, error: signupError}] = useMutation(SIGNUP_MUTATION, {
    variables: {
      name: formState.name,
      email: formState.email,
      password: formState.password
    },
    onCompleted: async ({ signup }) => {
      secureLocalStorage.setItem(AUTH_TOKEN, signup.token);
      router.push('/new/1');
    },
    onError: (err) => {
      //console.log(err);
    }
  });

  useEffect(() => {
    if (formState.login){
      setPasswdInputStr('Please type password');
    }else{
      setPasswdInputStr('Choose a safe password');
    }
  },[formState.login]);

  return (
    <div>
      <h4 className="mv3">
        {formState.login ? 'Login' : 'Sign Up'}
      </h4>
      <div className="flex flex-column">
        {!formState.login && (
          <input
            value={formState.name}
            onChange={(e) => {
              setInputErr('');
              setFormState({
                ...formState,
                name: e.target.value
              });
            }}
            type="text"
            placeholder="Your name"
            ref={nameEl}
          />
        )}
        <input
          value={formState.email}
          onChange={(e) => {
            setInputErr('');
            setFormState({
              ...formState,
              email: e.target.value
            });
          }
          }
          type="text"
          placeholder="Your email address"
          ref={emailEl}
        />
        <input
          value={formState.password}
          onChange={(e) => {
            setInputErr('');
            setFormState({
              ...formState,
              password: e.target.value
            });
          }
          }
          type="password"
          placeholder={passwdInputStr}
          ref={pwdEl}
        />
      </div>
      <div className="flex mt3">
        <button
           className="pointer mr2 button"
           onClick={() => {
            setInputErr('');
            if (!formState.login && !formState.name){
               setInputErr('Please enter your name');
               nameEl.current?.focus();
               return;
            }
            if (!formState.email){
               setInputErr('Please enter your email address');
               emailEl.current?.focus();
               return;
            }
            if (!formState.password){
               setInputErr('Please enter your password');
               pwdEl.current?.focus();
               return;
            }
            if (formState.login){
               login();
            }else{
               signup(); 
            }
           }}
        >
        {formState.login ? 'login' : 'create account'}
        </button>
        <button
           className="pointer mr2 button"
           onClick={(e) => {
            setInputErr('');
            setFormState({
              ...formState,
              login: !formState.login
            })
           }}
        >
         {formState.login
           ? 'create an account?'
           : 'already have an account?'}
        </button>
        <button
           className="pointer button"
           onClick={(e) => router.push('/forgotpasswd')}
        >forgot password?
        </button>
      </div>
      <div className="f6 lh-copy red">{inputErr}</div>
      {formState.login 
      ? (<div className="f6 lh-copy red">{loginError && loginError.message}</div>)
      : (<div className="f6 lh-copy red">{signupError && signupError.message}</div>)
      }
      {(loginLoading || signupLoading) &&
        <div className={loaderStyles.loadermodal}>
          <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
        </div>
      }
   </div>
  );
};

export default Login;