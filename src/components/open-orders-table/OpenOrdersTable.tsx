import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';

import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  DialogTitle,
  Button,
  DialogActions,
  DialogContent,
  Box,
  TablePagination,
} from '@mui/material';

import { ReactComponent as RefreshIcon } from 'assets/icons/refreshIcon.svg';
import { cancelOrder } from 'blockchain-api/contract-interactions/cancelOrder';
import { getSigner } from 'blockchain-api/getSigner';
import { signMessages } from 'blockchain-api/signMessage';
import { Dialog } from 'components/dialog/Dialog';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { ToastContent } from 'components/toast-content/ToastContent';
import { createSymbol } from 'helpers/createSymbol';
import { getCancelOrder, getOpenOrders } from 'network/network';
import { clearOpenOrdersAtom, openOrdersAtom, selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
import { AlignE } from 'types/enums';
import { OrderWithIdI, TableHeaderI } from 'types/types';

import { OpenOrderRow } from './elements/OpenOrderRow';

import styles from './OpenOrdersTable.module.scss';

export const OpenOrdersTable = memo(() => {
  const { address } = useAccount();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [openOrders, setOpenOrders] = useAtom(openOrdersAtom);
  const [, clearOpenOrders] = useAtom(clearOpenOrdersAtom);
  const [traderAPI] = useAtom(traderAPIAtom);

  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithIdI | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOrderCancel = useCallback((order: OrderWithIdI) => {
    setCancelModalOpen(true);
    setSelectedOrder(order);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleCancelOrderConfirm = useCallback(() => {
    if (!selectedOrder) {
      return;
    }

    if (requestSent) {
      return;
    }

    setRequestSent(true);
    getCancelOrder(selectedOrder.symbol, selectedOrder.id)
      .then((data) => {
        if (data.data.digest) {
          const signer = getSigner();
          signMessages(signer, [data.data.digest])
            .then((signatures) => {
              cancelOrder(signer, signatures[0], data.data, selectedOrder.id)
                .then(() => {
                  setCancelModalOpen(false);
                  setSelectedOrder(null);
                  setRequestSent(false);

                  toast.success(<ToastContent title="Cancel order processed" bodyLines={[]} />);
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
                  console.error(error);
                  setRequestSent(false);
                });
            })
            .catch((error) => {
              console.error(error);
              setRequestSent(false);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        setRequestSent(false);
      });
  }, [selectedOrder, requestSent]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }, []);

  const refreshOpenOrders = useCallback(() => {
    if (selectedPool !== null && address) {
      clearOpenOrders();
      selectedPool.perpetuals.forEach(({ baseCurrency, quoteCurrency }) => {
        const symbol = createSymbol({
          baseCurrency,
          quoteCurrency,
          poolSymbol: selectedPool.poolSymbol,
        });
        getOpenOrders(traderAPI, symbol, address, Date.now()).then(({ data }) => {
          setOpenOrders(data);
        });
      });
    }
  }, [address, selectedPool, traderAPI, clearOpenOrders, setOpenOrders]);

  const openOrdersHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: 'Symbol', align: AlignE.Left },
      { label: 'Side', align: AlignE.Left },
      { label: 'Type', align: AlignE.Left },
      { label: 'Position Size', align: AlignE.Right },
      { label: 'Limit Price', align: AlignE.Right },
      { label: 'Stop Price', align: AlignE.Right },
      { label: 'Leverage', align: AlignE.Right },
      { label: 'Good until', align: AlignE.Left },
      { label: <RefreshIcon onClick={refreshOpenOrders} className={styles.actionIcon} />, align: AlignE.Center },
    ],
    [refreshOpenOrders]
  );

  return (
    <>
      <TableContainer className={styles.root}>
        <MuiTable>
          <TableHead className={styles.tableHead}>
            <TableRow>
              {openOrdersHeaders.map((header) => (
                <TableCell key={header.label.toString()} align={header.align}>
                  <Typography variant="bodySmall">{header.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className={styles.tableBody}>
            {openOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
              <OpenOrderRow key={order.id} order={order} handleOrderCancel={handleOrderCancel} />
            ))}
            {openOrders.length === 0 && <EmptyTableRow colSpan={openOrdersHeaders.length} text="No open orders" />}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {openOrders.length > 5 && (
        <Box className={styles.paginationHolder}>
          <TablePagination
            align="center"
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={openOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
      <Dialog open={isCancelModalOpen}>
        <DialogTitle>Cancel Open Order</DialogTitle>
        <DialogContent>Are you sure you want to cancel this order?</DialogContent>
        <DialogActions>
          <Button onClick={closeCancelModal} variant="secondary" size="small">
            Cancel
          </Button>
          <Button onClick={handleCancelOrderConfirm} variant="primary" size="small">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
