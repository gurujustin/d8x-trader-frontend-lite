import { memo, useMemo } from 'react';

import { Box } from '@mui/material';

import { Container } from 'components/container/Container';
import { Header } from 'components/header/Header';
import { Footer } from 'components/footer/Footer';
import { StaticBackground } from 'components/static-background/StaticBackground';
import { PerpetualStats } from 'components/perpetual-stats/PerpetualStats';
import { PositionsTable } from 'components/positions-table/PositionsTable';
import { SelectorItemI, TableSelector } from 'components/table-selector/TableSelector';

import styles from './TraderPage.module.scss';

const placeHolderStyles = {
  backgroundColor: 'white',
  height: 200,
  padding: '2rem',
  borderRadius: '0 16px 16px 16px',
};

export const TraderPage = memo(() => {
  const selectorItems: SelectorItemI[] = useMemo(
    () => [
      {
        label: 'Positions',
        item: <PositionsTable />,
      },
      {
        label: 'Open Orders',
        item: <Box sx={placeHolderStyles}>Open Orders Placeholder</Box>,
      },
    ],
    []
  );
  return (
    <>
      <StaticBackground />
      <Box className={styles.rootBox}>
        <Header />
        <Container className={styles.contentContainer}>
          <PerpetualStats />
          <TableSelector selectorItems={selectorItems} />
        </Container>
        <Footer />
      </Box>
    </>
  );
});
