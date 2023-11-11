import Dropdown from '@/components/Dropdown/Dropdown';
import {Input} from '@/components/Inputs/Input';
import ProductSizeList from '@/components/ProductSize/ProductSizeList';
import Textarea from '@/components/Textarea/Textarea';
import useGet from '@/hooks/useGet';
import theme from '@/styles/theme/commonTheme';
import {BrandsResponse} from '@/types/brand';
import {ColorsResponse} from '@/types/color';
import {GendersResponse} from '@/types/gender';
import {ProductRequest} from '@/types/product';
import {SizesResponse} from '@/types/size';

import {Box, Grid, SxProps} from '@mui/material';
import {UseFormReturn} from 'react-hook-form';

const styles: Record<string, SxProps> = {
  dropdowns: {
    display: 'flex',
    gap: '1rem',
  },
  form: {
    display: 'flex',
    columnGap: '5rem',
    rowGap: '3rem',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  formContainer: {
    width: 440,
    [theme.breakpoints.down('md')]: {
      width: 'auto',
    },
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flexShrink: 1,
  },
};

type FormContainerProps = {
  formProps: Pick<
    UseFormReturn<ProductRequest>,
    'register' | 'control' | 'getValues' | 'setValue'
  >;
};

const FormContainer = ({formProps}: FormContainerProps) => {
  const {data: genders} = useGet<GendersResponse>('/genders');
  const {data: colors} = useGet<ColorsResponse>('/colors');
  const {data: brands} = useGet<BrandsResponse>('/brands');
  const {data: sizes} = useGet<SizesResponse>('/sizes');

  const sizesMapped =
    sizes?.data.map(({id, attributes}) => ({
      id,
      value: attributes.value!,
    })) ?? [];

  const checkSize = (id: number, isChecked: boolean) => {
    const oldSizes = formProps.getValues('sizes') || [];
    const oldSize = sizesMapped.find(size => size.id === id);
    const newSizes =
      oldSize && isChecked
        ? [...oldSizes, oldSize]
        : oldSizes.filter(size => size.id !== id);
    formProps.setValue('sizes', newSizes);
  };

  return (
    <Grid sx={styles.formContainer}>
      <Input
        labelText="Product name"
        register={formProps.register}
        validationSchema={{required: 'Product name is required'}}
        name="name"
        placeholder="Nike Air Max 90"
      />
      <Input
        name="price"
        labelText="Price"
        register={formProps.register}
        validationSchema={{
          required: 'Price is required',
          min: {
            value: 1,
            message: 'Price must be greater than 0',
          },
          onChange: e =>
            formProps.setValue(
              'price',
              Number(e.target.value.replace(/\D/g, '')),
            ),
        }}
      />
      <Box sx={styles.dropdowns}>
        <Dropdown
          name="gender"
          labelText="Gender"
          register={formProps.register}
          validationSchema={undefined}
          options={genders?.data.map(({id, attributes}) => ({
            value: id,
            text: attributes.name!,
          }))}
        />
        <Dropdown
          name="brand"
          labelText="Brand"
          register={formProps.register}
          validationSchema={undefined}
          options={brands?.data.map(({id, attributes}) => ({
            value: id,
            text: attributes.name!,
          }))}
        />
      </Box>
      <Textarea
        labelText="Description"
        register={formProps.register}
        validationSchema={{
          required: 'Description is required',
          onChange: e =>
            formProps.setValue(
              'description',
              e.target.value.length > 300
                ? e.target.value.slice(0, 300)
                : e.target.value,
            ),
        }}
        name="description"
        minRows={8}
        placeholder="Do not exceed 300 characters."
      />
      <ProductSizeList
        control={formProps.control}
        header="Add size"
        sizes={sizesMapped}
        onClick={checkSize}
      />
    </Grid>
  );
};

export default FormContainer;