import React, {
  useRef,
  useState,
  ChangeEvent,
  SyntheticEvent,
  useEffect,
} from 'react';
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
  UseRiveParameters,
  RiveState,
  StateMachineInput,
} from 'rive-react';
import { Toaster, toast } from 'sonner';
import './LoginFormComponent.css';
import 'sonner/dist/styles.css';

const STATE_MACHINE_NAME = 'Login Machine';
const LOGIN_TEXT = 'Login';

type LoginMockData = {
  success: {
    usuario: string;
    password: string;
  };
  error: {
    usuario: string;
    password: string;
  };
};

const DEFAULT_LOGIN_MOCK: LoginMockData = {
  success: {
    usuario: 'demo',
    password: 'teddy',
  },
  error: {
    usuario: 'demo',
    password: 'error',
  },
};

/**
 * Use case for a simple login experience that incorporates a Rive asset with a
 * state machine to coordinate user interaction with a form
 * @param riveProps
 */
const LoginFormComponent = (riveProps: UseRiveParameters = {}) => {
  const { rive: riveInstance, RiveComponent }: RiveState = useRive({
    src: '/login-teddy.riv',
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    ...riveProps,
  });
  const [userValue, setUserValue] = useState('');
  const [passValue, setPassValue] = useState('');
  const [inputLookMultiplier, setInputLookMultiplier] = useState(0);
  const [loginButtonText, setLoginButtonText] = useState(LOGIN_TEXT);
  const [loginMock, setLoginMock] = useState<LoginMockData>(DEFAULT_LOGIN_MOCK);
  const [isUserTouched, setIsUserTouched] = useState(false);
  const [isPassTouched, setIsPassTouched] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/mock-login.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load mock-login.json');
        }
        return response.json();
      })
      .then((data: LoginMockData) => {
        if (data?.success?.usuario && data?.success?.password) {
          setLoginMock(data);
        }
      })
      .catch(() => {
        // Keep default credentials if the JSON file is not available.
      });
  }, []);

  const isCheckingInput: StateMachineInput | null = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'isChecking'
  );
  const numLookInput: StateMachineInput | null = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'numLook'
  );
  const trigSuccessInput: StateMachineInput | null = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'trigSuccess'
  );
  const trigFailInput: StateMachineInput | null = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'trigFail'
  );
  const isHandsUpInput: StateMachineInput | null = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'isHandsUp'
  );

  // Divide the input width by the max value the state machine looks for in numLook.
  // This gets us a multiplier we can apply for each character typed in the input
  // to help Teddy track progress along the input line
  useEffect(() => {
    if (inputRef?.current && !inputLookMultiplier) {
      setInputLookMultiplier(
        (inputRef.current as HTMLInputElement).offsetWidth / 100
      );
    }
  }, [inputRef]);

  // As the user types in the username box, update the numLook value to let Teddy know
  // where to look to according to the state machine
  const onUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setUserValue(newVal);
    if (!isCheckingInput!.value) {
      isCheckingInput!.value = true;
    }
    const numChars = newVal.length;
    numLookInput!.value = numChars * inputLookMultiplier;
  };

  // Start Teddy looking in the correct spot along the username input
  const onUsernameFocus = () => {
    isCheckingInput!.value = true;
    if (numLookInput!.value !== userValue.length * inputLookMultiplier) {
      numLookInput!.value = userValue.length * inputLookMultiplier;
    }
  };

  // When submitting, simulate password validation checking and trigger the appropriate input from the
  // state machine
  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!userValue.trim() || !passValue.trim()) {
      toast.error('Completa usuario y contraseña');
      trigFailInput?.fire();
      return false;
    }

    setLoginButtonText('Checking...');
    setTimeout(() => {
      setLoginButtonText(LOGIN_TEXT);
      userValue === loginMock.success.usuario &&
      passValue === loginMock.success.password
        ? (trigSuccessInput?.fire(), toast.success('Login exitoso'))
        : (trigFailInput?.fire(), toast.error('Usuario o contraseña incorrectos'));
    }, 1500);
    return false;
  };

  const isUserInvalid = (hasSubmitted || isUserTouched) && !userValue.trim();
  const isPassInvalid = (hasSubmitted || isPassTouched) && !passValue.trim();

  return (
    <div className="login-form-component-root">
      <Toaster position="top-center" richColors closeButton />
      <div className="login-form-wrapper">
        <div className="rive-wrapper">
          <RiveComponent className="rive-container" />
        </div>
        <div className="form-container">
          <form onSubmit={onSubmit}>
            <label>
              <input
                type="text"
                className={`form-username ${isUserInvalid ? 'input-error' : ''}`}
                name="username"
                placeholder="Username"
                onFocus={onUsernameFocus}
                value={userValue}
                onChange={onUsernameChange}
                onBlur={() => {
                  isCheckingInput!.value = false;
                  setIsUserTouched(true);
                }}
                ref={inputRef}
                aria-invalid={isUserInvalid}
              />
            </label>
            <label>
              <input
                type="password"
                className={`form-pass ${isPassInvalid ? 'input-error' : ''}`}
                name="password"
                placeholder="Password"
                value={passValue}
                onFocus={() => (isHandsUpInput!.value = true)}
                onBlur={() => {
                  isHandsUpInput!.value = false;
                  setIsPassTouched(true);
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassValue(e.target.value)
                }
                aria-invalid={isPassInvalid}
              />
            </label>
            <button className="login-btn">{loginButtonText}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginFormComponent;