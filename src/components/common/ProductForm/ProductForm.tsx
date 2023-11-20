import {Image} from '@/types';
import {useSession} from 'next-auth/react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';
import FormContainer from './components/FormContainer';
import ImagesContainer from './components/ImagesContainer';
import theme from '@/config/theme';
import {Box, Button, SxProps, Typography} from '@mui/material';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {FieldErrors, useForm} from 'react-hook-form';
import {Product, ProductAttributes, ProductRequest} from '@/types';
import {BorderLinearProgress} from '../BorderLinearProgress/BorderLinearProgress';

const styles: Record<string, SxProps> = {
  mainContainer: {
    padding: '50px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
    [theme.breakpoints.down('md')]: {
      padding: '0',
    },
    [theme.breakpoints.down('md')]: {
      padding: '30px 20px',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    fontWeight: 300,
    lineHeight: 1.2,
    width: '80%',
  },
  dropdowns: {
    display: 'flex',
    gap: '1rem',
  },
  form: {
    display: 'flex',
    gap: '5rem',
    [theme.breakpoints.down('lg')]: {
      gap: '3rem',
      flexDirection: 'column',
    },
  },
};

const oneCategoryPercentage = 11.1111111111; // one of nine
type ProgresStatusType = 'secondary' | 'error' | 'success';
const statusColors = {
  secondary: '#9c27b0',
  error: '#fe645e',
  success: '#2e7d32',
};

type ProductFormContextType = {
  gender: number;
  setGender: Dispatch<SetStateAction<number>>;
  brand: number;
  setBrand: Dispatch<SetStateAction<number>>;
  chosenSizes: number[];
  setChosenSizes: Dispatch<SetStateAction<number[]>>;
  images: Pick<Image, 'id' | 'url'>[];
  setImages: Dispatch<SetStateAction<Pick<Image, 'id' | 'url'>[]>>;
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  color: number;
  setColor: Dispatch<SetStateAction<number>>;
  chosenCategories: number[];
  setChosenCategories: Dispatch<SetStateAction<number[]>>;
  isLoading: boolean;
  trigger: UseFormTrigger<ProductFormData>;
};

export const ProductFormContext = createContext<ProductFormContextType>(
  {} as ProductFormContextType,
);

export type ProductFormData = Pick<Product, 'name' | 'description' | 'price'>;

type ProductFormProps = {
  onSubmit: (data: any) => void;
  product?: ProductAttributes;
  isLoading?: boolean;
};

const ProductForm = ({onSubmit, product, isLoading}: ProductFormProps) => {
  const session = useSession();
  const [gender, setGender] = useState<number>(product?.gender?.data?.id || 0);
  const [brand, setBrand] = useState<number>(product?.brand?.data?.id || 0);
  const [color, setColor] = useState<number>(product?.color?.data?.id || 0);
  const [chosenSizes, setChosenSizes] = useState<number[]>(
    product?.sizes?.data.map(({id}) => id) || [],
  );
  const [chosenCategories, setChosenCategories] = useState<number[]>(
    product?.categories?.data.map(({id}) => id) || [],
  );
  const [images, setImages] = useState<Pick<Image, 'id' | 'url'>[]>(
    product?.images?.data?.map(({id, attributes: {url}}) => ({id, url})) || [],
  );
  const [createProductProgress, setCreateProductProgress] = useState(0);
  const [progressStatus, setProgressStatus] =
    useState<ProgresStatusType>('error');

  const {
    register,
    handleSubmit,
    setValue,
    formState: {errors},
    trigger,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      description: product?.description || '',
    },
  });

  const formValueName = watch('name');
  const formValuePrice = watch('price');
  const formValueDescription = watch('description');

  useEffect(() => {
    let counter = 0;
    if (formValueName) {
      counter++;
    }
    if (formValuePrice) {
      counter++;
    }
    if (formValueDescription) {
      counter++;
    }
    if (gender) {
      counter++;
    }
    if (brand) {
      counter++;
    }
    if (color) {
      counter++;
    }
    if (chosenSizes.length) {
      counter++;
    }
    if (chosenCategories.length) {
      counter++;
    }
    if (images.length) {
      counter++;
    }
    if (counter !== createProductProgress) {
      setCreateProductProgress(counter);
    }
    if (counter === 9) {
      setProgressStatus('success');
    } else {
      if (formValueName && formValuePrice && formValueDescription) {
        setProgressStatus('secondary');
      } else {
        setProgressStatus('error');
      }
    }
  }, [
    formValueName,
    formValuePrice,
    formValueDescription,
    gender,
    brand,
    color,
    chosenSizes,
    chosenCategories,
    images,
    createProductProgress,
  ]);

  const handleOnSubmit = (data: ProductRequest) => {
    const values = {
      ...data,
      gender,
      brand,
      color,
      sizes: chosenSizes,
      categories: chosenCategories,
      images,
      teamName: 'team-3',
      userID: session.data?.user.id,
    };
    const filteredValues = Object.entries(values).filter(
      ([key, value]) =>
        !(Array.isArray(value) && value.length === 0) && Boolean(value),
    );
    const body = Object.fromEntries(filteredValues);
    onSubmit(body);
  };

  return (
    <ProductFormContext.Provider
      value={{
        gender,
        setGender,
        brand,
        setBrand,
        chosenSizes,
        setChosenSizes,
        images,
        setImages,
        register,
        errors,
        setValue,
        color,
        setColor,
        chosenCategories,
        setChosenCategories,
        isLoading: isLoading || false,
        trigger,
      }}
    >
      <Box
        sx={styles.mainContainer}
        component="form"
        onSubmit={handleSubmit(handleOnSubmit)}
      >
        <Box sx={styles.header}>
          <Typography variant="h1">
            {product ? 'Edit product' : 'Add a product'}
          </Typography>
          <Button variant="contained" type="submit" disabled={isLoading}>
            Save
          </Button>
        </Box>
        <Typography sx={styles.description}>
          Please complete the fields below and select the relevant information
          so that other people can familiarize themselves with your product
        </Typography>
        <Typography
          sx={{...styles.description, color: statusColors[progressStatus]}}
        >
          Item filling level:{' '}
          <b>
            {progressStatus === 'error'
              ? ' Please, provide required fileds'
              : progressStatus === 'secondary'
              ? ' Add more descriptions to your product'
              : ' Great! You have filled in all fields'}
          </b>
        </Typography>
        <BorderLinearProgress
          variant="determinate"
          color={progressStatus}
          value={createProductProgress * oneCategoryPercentage}
        />
        <Box sx={styles.form}>
          <FormContainer />
          <ImagesContainer />
        </Box>
      </Box>
    </ProductFormContext.Provider>
  );
};

export default ProductForm;
