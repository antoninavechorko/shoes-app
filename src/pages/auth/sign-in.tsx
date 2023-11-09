import {SubmitHandler, useForm} from 'react-hook-form';
import {SignInResponse, signIn} from 'next-auth/react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Link from 'next/link';
import {Button} from '@/components/Button/Button';
import {Input} from '@/components/Inputs/Input';
import Image from 'next/image';
import {useRouter} from 'next/router';
import {toast} from 'react-toastify';
import logoIcon from '../../../public/icons/logo.svg';
import theme from '@/styles/theme/commonTheme';
import {styles} from './styles';

interface SignInType {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<SignInType>({
    defaultValues: {email: '', password: '', rememberMe: false},
  });
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const onSubmit: SubmitHandler<SignInType> = async data => {
    const response: SignInResponse | undefined = await signIn('credentials', {
      identifier: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
      redirect: false,
    });
    if (response?.ok) {
      localStorage.setItem('signInJustNow', JSON.stringify(true));
      router.push('/');
    } else {
      toast.error('Wrong credentials!');
    }
  };

  return (
    <Box sx={styles.tab}>
      <Box sx={styles.header}>
        <Link href="/" style={styles.headerImage}>
          <Image src={logoIcon} alt="" />
        </Link>
      </Box>
      <Box sx={styles.container}>
        <Box sx={styles.wrapper}>
          <Typography variant="h1" sx={styles.title}>
            Welcome back
          </Typography>
          <Typography component="h5" sx={styles.titleText}>
            Welcome back! Please enter your details to log into your account.
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={styles.formContainer}
          >
            <Box sx={styles.form}>
              <Input
                labelText="Email"
                register={register}
                name="email"
                validationSchema={{
                  required: true,
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Entered value does not match email format',
                  },
                }}
                required={true}
                errorMessage={errors.email?.message}
              />
              <Input
                labelText="Password"
                register={register}
                name="password"
                validationSchema={{
                  required: true,
                  minLength: {
                    value: 6,
                    message: 'Min length is 6',
                  },
                }}
                required={true}
                type="password"
                errorMessage={errors.password?.message}
              />
            </Box>

            <Box sx={styles.checkboxContainer}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...register('rememberMe', {})}
                    sx={styles.checkbox}
                  />
                }
                label={<Typography variant="body1">Remember me</Typography>}
              />
              <Link href="/auth/forgot-password" style={styles.link}>
                <Typography>Forgot password?</Typography>
              </Link>
            </Box>

            <Button type="submit">Sign in</Button>
          </Box>
          <Box sx={styles.linksContainer}>
            <Typography component="span">Don’t have an account?</Typography>
            <Link href={'/auth/sign-up'} style={styles.link}>
              <Typography>Sign up</Typography>
            </Link>
          </Box>
        </Box>
        {!isMobile && (
          <Box sx={styles.imageWrapper}>
            <Image
              src="/images/signInBanner.png"
              alt="picture of our brand"
              fill={true}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
