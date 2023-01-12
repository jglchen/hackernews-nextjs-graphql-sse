import { useState, useEffect, useRef, FormEvent } from 'react';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import  secureLocalStorage  from  "react-secure-storage";
import { AUTH_TOKEN, TEMP_TOKEN } from '@/lib/constants';
import { PasswdCheck } from '@/lib/types';
import loaderStyles from '@/styles/loader.module.css';

const FORGOTPASSWD_QUERY = gql`
  query ForgotPasswdQuery(
    $email: String!
  ) {
    forgotpasswd(email: $email) {
      mail_sent
      numForCheck
      token
    }
  }
`;

const RESETPASSWD_MUTATION = gql`
  mutation resetPasswdMutation(
    $password: String!
  ) {
    resetpasswd(
      password: $password
    ) {
      id
    }
  }
`;

const ForgotPasswd = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailerr, setEmailErr] = useState('');
  const emailEl = useRef<HTMLInputElement | null>(null);
  const [checkdata, setCheckdata] = useState<PasswdCheck | null>(null);
  const [numForCheck, setNumForCheck] = useState('');
  const [numchkerr, setNumchkerr] = useState('');
  const numchkEl = useRef<HTMLInputElement | null>(null);
  const [passwd, setPasswd] = useState('');
  const [passwd2, setPasswd2] = useState('');
  const [passwderr, setPassWdErr] = useState('');
  const passwdEl = useRef<HTMLInputElement | null>(null);
  const passwd2El = useRef<HTMLInputElement | null>(null);
 
  const [executeForgotPasswd, { data: emailCheck, loading: checkLoading, error: checkError }] = useLazyQuery(
    FORGOTPASSWD_QUERY, {fetchPolicy: 'network-only'}
  );

  const [resetPasswd, {data: resetData, loading: resetLoading, error: resetError}] = useMutation(RESETPASSWD_MUTATION, {
    variables: {
      password: passwd
    },
    onCompleted: async ({ login }) => {
      secureLocalStorage.removeItem(TEMP_TOKEN);
      secureLocalStorage.setItem(AUTH_TOKEN, checkdata?.token!);
      resetPasswdForm();
      router.push('/new/1');
    },
    onError: (err) => {
      //console.log(err);
    }
  });

  useEffect(() => {
    if (!emailCheck){
      return;
    }

    const {forgotpasswd} = emailCheck;
    if (!forgotpasswd.mail_sent){
      setEmailErr("Sorry, we can't find this account.");
      emailEl.current?.focus();
      return;
    }
    if (forgotpasswd.mail_sent){
      setEmailErr("Email for password reset has been already sent");
    }
    setCheckdata(forgotpasswd);
    setEmailErr('');
  },[emailCheck]);


  function handleEmailChange(e: FormEvent<HTMLInputElement>){
    let { value } = e.currentTarget;
    //Remove all the markups to prevent Cross-site Scripting attacks
    value = value.trim().replace(/<\/?[^>]*>/g, "");
    setEmail(value);
    setEmailErr('');
  }

  function handleNumberChk(e: FormEvent<HTMLInputElement>){
    let { value } = e.currentTarget;
    //Remove all the markups to prevent Cross-site Scripting attacks
    value = value.trim().replace(/<\/?[^>]*>/g, "");
    setNumForCheck(value);
    setNumchkerr('');
  }

  function submitNumberCheck(){
    setNumchkerr('');
    if (checkdata && numForCheck != checkdata.numForCheck){
       setNumchkerr('The number you typed is not matched to the figure in the email.');
       numchkEl.current?.focus();
       return;
    }
  }

  async function submitPasswdReset(){
    //Reset all the err messages
    setPassWdErr('');

    //Check if Passwd is filled
    if (!passwd || !passwd2){
       setPassWdErr("Please type your password, this field is required!");
       if (!passwd){
          passwdEl.current?.focus();
       }else{
          passwd2El.current?.focus();
       }
       return;
    }
    //Check the passwords typed in the two fields are matched
    if (passwd != passwd2){
       setPassWdErr("Please retype your passwords, the passwords you typed in the two fields are not matched!");
       passwdEl.current?.focus();
       return;
    }

    secureLocalStorage.setItem(AUTH_TOKEN, checkdata?.token!);
    resetPasswd();

  }

  function resetPasswdForm(){
    setPasswd('');
    setPasswd2('');
    setPassWdErr('');
  }

  return (
    <div>
      <h4 className="mv3">
        Forgot Password
      </h4>
      {checkdata &&
      <>
      {numForCheck == checkdata.numForCheck &&
      <>
      <div className="flex flex-column">
        <div>Please reset your password</div>
          <input
            type="password"
            value={passwd}
            placeholder="Password"
            ref={passwdEl}
            onChange={(e) => setPasswd(e.target.value.trim())}    
          />
          <div className="f6 lh-copy red">{passwderr}</div>
          <div className="f6 lh-copy red">{resetError?.message}</div>
          <input
            type="password"
            value={passwd2}
            placeholder="Please type password again"
            ref={passwd2El}
            onChange={(e) => setPasswd2(e.target.value.trim())}    
          />
      </div>
      <div className="flex mt3">
        <button
          className="pointer mr2 button"
          onClick={submitPasswdReset}
        >reset password
        </button>
        <button
          className="pointer button"
          onClick={(e) => router.push('/login')}
        >back to login
        </button>
      </div>
      </>
      }
      {numForCheck != checkdata.numForCheck &&
      <>
      <div className="flex flex-column">
        <div>Email for password reset has been already sent! Please check the email we sent to you, and type the number in the following.</div>
        <input
          value={numForCheck}
          onChange={handleNumberChk}
          type="text"
          placeholder="Please type the number you got in the email"
          ref={numchkEl}
        />
        <div className="f6 lh-copy red">{numchkerr}</div>
      </div>
      <div className="flex mt3">
        <button
          className="pointer mr2 button"
          onClick={submitNumberCheck}
        >send
        </button>
        <button
          className="pointer button"
          onClick={(e) => router.push('/login')}
        >back to login
        </button>
      </div>
      </>
      }
      </>
      }
      {!checkdata &&
      <>
      <div className="flex flex-column">
        <input
          value={email}
          onChange={handleEmailChange}
          type="text"
          placeholder="Your email address"
          ref={emailEl}
        />
        <div className="f6 lh-copy red">{emailerr}</div>
        <div className="f6 lh-copy red">{checkError?.message}</div>
      </div>
      <div className="flex mt3">
        <button
          className="pointer mr2 button"
          onClick={() => {
            setEmailErr('');
 
            executeForgotPasswd({
              variables: { email }
            });
          }}
        >send password reset email
        </button>
        <button
          className="pointer button"
          onClick={(e) => router.push('/login')}
        >back to login
        </button>
      </div>
      </>
      }
      {(checkLoading || resetLoading) &&
        <div className={loaderStyles.loadermodal}>
          <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
        </div>
      }
    </div> 
  )
};

export default ForgotPasswd;