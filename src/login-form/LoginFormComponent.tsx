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
  const [showTestPanel, setShowTestPanel] = useState(false);
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
      const isSuccessLogin =
        userValue === loginMock.success.usuario &&
        passValue === loginMock.success.password;
      const isKnownErrorCase =
        userValue === loginMock.error.usuario &&
        passValue === loginMock.error.password;

      if (isSuccessLogin) {
        trigSuccessInput?.fire();
        toast.success('Login exitoso');
        return;
      }

      trigFailInput?.fire();
      if (isKnownErrorCase) {
        toast.error('Error simulado: credenciales marcadas como error');
      } else {
        toast.error('Usuario o contraseña incorrectos');
      }
    }, 1500);
    return false;
  };

  const loadScenario = (scenario: 'success' | 'error') => {
    setUserValue(loginMock[scenario].usuario);
    setPassValue(loginMock[scenario].password);
    setIsUserTouched(false);
    setIsPassTouched(false);
    setHasSubmitted(false);

    isCheckingInput?.value && (isCheckingInput.value = false);
    isHandsUpInput?.value && (isHandsUpInput.value = false);
    if (numLookInput && inputLookMultiplier) {
      numLookInput.value = loginMock[scenario].usuario.length * inputLookMultiplier;
    }

    toast.message(
      scenario === 'success'
        ? 'Credenciales de success cargadas'
        : 'Credenciales de error cargadas'
    );
  };

  const runAnimation = (
    animation:
      | 'look'
      | 'handsUp'
      | 'handsDown'
      | 'success'
      | 'fail'
      | 'reset'
  ) => {
    if (animation === 'look') {
      isCheckingInput && (isCheckingInput.value = true);
      numLookInput && (numLookInput.value = 60);
      toast.message('Animacion: mirar al input');
      return;
    }

    if (animation === 'handsUp') {
      isHandsUpInput && (isHandsUpInput.value = true);
      toast.message('Animacion: manos arriba');
      return;
    }

    if (animation === 'handsDown') {
      isHandsUpInput && (isHandsUpInput.value = false);
      toast.message('Animacion: manos abajo');
      return;
    }

    if (animation === 'success') {
      trigSuccessInput?.fire();
      toast.success('Animacion: success');
      return;
    }

    if (animation === 'fail') {
      trigFailInput?.fire();
      toast.error('Animacion: fail');
      return;
    }

    isCheckingInput && (isCheckingInput.value = false);
    isHandsUpInput && (isHandsUpInput.value = false);
    numLookInput && (numLookInput.value = 0);
    toast.message('Animacion: reset');
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
          <button
            type="button"
            className="toggle-test-panel"
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            {showTestPanel ? '✕ Cerrar pruebas' : '⚙ Pruebas'}
          </button>
          <div className={`test-panel ${showTestPanel ? 'test-panel-visible' : 'test-panel-hidden'}`}>
            <p className="test-title">Probar escenarios</p>
            <div className="test-actions">
              <button
                type="button"
                className="test-btn"
                onClick={() => loadScenario('success')}
              >
                Cargar success
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => loadScenario('error')}
              >
                Cargar error
              </button>
            </div>

            <p className="test-title">Animaciones del bear</p>
            <div className="test-actions test-actions-grid">
              <button
                type="button"
                className="test-btn"
                onClick={() => runAnimation('look')}
              >
                Mirar input
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => runAnimation('handsUp')}
              >
                Manos arriba
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => runAnimation('handsDown')}
              >
                Manos abajo
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => runAnimation('success')}
              >
                Success
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => runAnimation('fail')}
              >
                Fail
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => runAnimation('reset')}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginFormComponent;