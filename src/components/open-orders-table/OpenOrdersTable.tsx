import { useAtom } from 'jotai';
import { memo } from 'react';

import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';

import { openOrdersAtom } from 'store/pools.store';

import { OpenOrderRow } from './elements/OpenOrderRow';

import styles from './OpenOrdersTable.module.scss';
import { EmptyTableRow } from '../empty-table-row/EmptyTableRow';

const openOrdersHeaders = [
  'Symbol',
  'Side',
  'Type',
  'Position Size',
  'Limit Price',
  'Stop Price',
  'Leverage',
  'Good until',
  '',
];

export const OpenOrdersTable = memo(() => {
  const [openOrders] = useAtom(openOrdersAtom);

  return (
    <TableContainer className={styles.root}>
      <MuiTable>
        <TableHead className={styles.tableHead}>
          <TableRow>
            {openOrdersHeaders.map((header) => (
              <TableCell key={header} align="left">
                <Typography variant="bodySmall">{header}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className={styles.tableBody}>
          {openOrders.map((order) => (
            <OpenOrderRow key={order.id} order={order} />
          ))}
          {openOrders.length === 0 && <EmptyTableRow colSpan={openOrdersHeaders.length} text="No open orders" />}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
});