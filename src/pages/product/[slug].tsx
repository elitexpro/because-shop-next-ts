import { NextPage, GetStaticPaths, GetStaticProps } from 'next';
import { Box, Button, Grid, Typography } from '@mui/material';
import 'react-slideshow-image/dist/styles.css';

import { ShopLayout } from '@/layouts';
import { dbProducts } from '@/api/db';
import { ProductSlidesShow, SizeSelector } from '@/teslo-shop/common';
import { ItemCounter } from '@/shared/components';
import { IProduct } from '@/interfaces';

interface ProductPageProps {
  product: IProduct;
}

const ProductPage: NextPage<ProductPageProps> = ({ product }) => {
  // // // Fetch de la data en Run Time / Req Time - Requiere 1 Loading - NO tiene SEO
  // // Perdemos SEO xq al inicio NO tiene info de title, desc ni NADA, lo unico q verian seria el Loader
  // const { query } = useRouter();
  // const { products: product, isLoading } = useProducts(`/products/${query.slug}`);

  return (
    <ShopLayout title={product.title} pageDescription={product.description}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={7}>
          <ProductSlidesShow images={product.images} />
        </Grid>

        <Grid item xs={12} sm={5}>
          <Box display="flex" flexDirection="column">
            {/* titles */}
            <Typography variant="h1" component="h1">
              {product.title}
            </Typography>
            <Typography variant="subtitle1" component="h2">
              ${product.price}
            </Typography>

            {/* Quantity: */}
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2">Quantity</Typography>

              <ItemCounter />
              <SizeSelector
                // selectedSize={product.sizes[3]}
                sizes={product.sizes}
              />
            </Box>

            {/* add to cart */}
            <Button color="secondary" className="circular-btn">
              Add to cart
            </Button>

            {/* <Chip label="Out of Stock" color="error" variant="outlined" /> */}

            {/* Description: */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2">Description</Typography>
              <Typography variant="body2">{product.description}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ShopLayout>
  );
};

/* 




*/

// You should use getStaticPaths if you’re statically pre-rendering pages that use dynamic routes
export const getStaticPaths: GetStaticPaths = async ctx => {
  const productSlugs = await dbProducts.getAllProductSlugs();

  return {
    paths: productSlugs.map(({ slug }) => ({
      params: { slug }, // [slug].tsx
    })),

    // genera la page en runtime y la almacena en filesystem (new products after build time)
    fallback: 'blocking', // ISG
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  const product = await dbProducts.getProductBySlug(slug);

  if (!product) {
    return {
      redirect: {
        // if it don't exist, redirect to /
        destination: '/',

        // this page could be exist in the future and it would be indexed
        permanent: false,
      },
    };
  }

  return {
    props: {
      product,
    },

    // ISR
    revalidate: 86400, // c/24h - in seconds  (60*60*24)
  };
};

export default ProductPage;

/* 

  * SSR:  getServerSideProps()   <--  No usar para productos, ya q queremos el comportamiento de Udemy. Tiene contenido Estatico q lo Revalida c/24h (alumnos, calificaciones, title) y q hace fetch en req time unicamente de la data q cambia constantemente como el price


// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { slug = '' } = params as { slug: string };
  const product = await dbProducts.getProductBySlug(slug);
  if (!product)
    return {
      redirect: {
        destination: '/',

        // page exist, allow indexing by google bots
        permanent: false,
      },
    };

  // TODO: meta tag de la imagen

  return {
    props: { product },
  };
};


 */
