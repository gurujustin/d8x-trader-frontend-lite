import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';

import { parseSymbol } from 'helpers/parseSymbol';
import { getOpenOrders } from 'network/network';
import {
  openOrdersAtom,
  perpetualStatisticsAtom,
  positionsAtom,
  removeOpenOrderAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
  webSocketReadyAtom,
} from 'store/pools.store';
import { PerpetualStatisticsI } from 'types/types';

import {
  CommonWsMessageI,
  ConnectWsMessageI,
  // ErrorWsMessageI,
  MessageTypeE,
  OnLimitOrderCreatedWsMessageI,
  OnPerpetualLimitOrderCancelledWsMessageI,
  OnTradeWsMessageI,
  OnUpdateMarginAccountWsMessageI,
  OnUpdateMarkPriceWsMessageI,
  SubscriptionWsMessageI,
} from './types';

function isConnectMessage(message: CommonWsMessageI): message is ConnectWsMessageI {
  return message.type === MessageTypeE.Connect;
}

// function isErrorMessage(message: CommonWsMessageI): message is ErrorWsMessageI {
//   return message.type === MessageTypeE.Error;
// }

function isSubscriptionMessage(message: CommonWsMessageI): message is SubscriptionWsMessageI {
  return message.type === MessageTypeE.Subscription;
}

function isUpdateMarkPriceMessage(message: CommonWsMessageI): message is OnUpdateMarkPriceWsMessageI {
  return message.type === MessageTypeE.OnUpdateMarkPrice;
}

function isUpdateMarginAccountMessage(message: CommonWsMessageI): message is OnUpdateMarginAccountWsMessageI {
  return message.type === MessageTypeE.OnUpdateMarginAccount;
}

function isPerpetualLimitOrderCancelledMessage(
  message: CommonWsMessageI
): message is OnPerpetualLimitOrderCancelledWsMessageI {
  return message.type === MessageTypeE.OnPerpetualLimitOrderCancelled;
}

function isTradeMessage(message: CommonWsMessageI): message is OnTradeWsMessageI {
  return message.type === MessageTypeE.OnTrade;
}

function isLimitOrderCreatedMessage(message: CommonWsMessageI): message is OnLimitOrderCreatedWsMessageI {
  return message.type === MessageTypeE.OnPerpetualLimitOrderCreated;
}

export function useWsMessageHandler() {
  const { address } = useAccount();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [, setWebSocketReady] = useAtom(webSocketReadyAtom);
  const [, setPerpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [, setPositions] = useAtom(positionsAtom);
  const [, setOpenOrders] = useAtom(openOrdersAtom);
  const [, removeOpenOrder] = useAtom(removeOpenOrderAtom);

  const updatePerpetualStats = useCallback(
    (stats: PerpetualStatisticsI) => {
      if (selectedPool && selectedPerpetual) {
        if (
          stats.baseCurrency === selectedPerpetual.baseCurrency &&
          stats.quoteCurrency === selectedPerpetual.quoteCurrency &&
          stats.poolName === selectedPool.poolSymbol
        ) {
          setPerpetualStatistics(stats);
        }
      }
    },
    [selectedPool, selectedPerpetual, setPerpetualStatistics]
  );

  return useCallback(
    (message: string) => {
      const parsedMessage = JSON.parse(message);

      if (isConnectMessage(parsedMessage)) {
        setWebSocketReady(true);
      } else if (isSubscriptionMessage(parsedMessage)) {
        const parsedSymbol = parseSymbol(parsedMessage.msg);
        if (!parsedSymbol) {
          return;
        }

        updatePerpetualStats({
          id: parsedMessage.data.id,
          baseCurrency: parsedMessage.data.baseCurrency,
          quoteCurrency: parsedMessage.data.quoteCurrency,
          poolName: parsedSymbol.poolSymbol,
          midPrice: parsedMessage.data.midPrice,
          markPrice: parsedMessage.data.markPrice,
          indexPrice: parsedMessage.data.indexPrice,
          currentFundingRateBps: parsedMessage.data.currentFundingRateBps,
          openInterestBC: parsedMessage.data.openInterestBC,
        });
      } else if (isUpdateMarkPriceMessage(parsedMessage)) {
        const parsedSymbol = parseSymbol(parsedMessage.data.obj.symbol);
        if (!parsedSymbol) {
          return;
        }

        const {
          perpetualId: id,
          midPrice,
          markPrice,
          indexPrice,
          fundingRate: currentFundingRateBps,
          openInterest: openInterestBC,
        } = parsedMessage.data.obj;

        updatePerpetualStats({
          id,
          baseCurrency: parsedSymbol.baseCurrency,
          quoteCurrency: parsedSymbol.quoteCurrency,
          poolName: parsedSymbol.poolSymbol,
          midPrice,
          markPrice,
          indexPrice,
          currentFundingRateBps,
          openInterestBC,
        });
      } else if (isUpdateMarginAccountMessage(parsedMessage)) {
        if (!address || address !== parsedMessage.data.obj.traderAddr) {
          return;
        }

        setPositions(parsedMessage.data.obj);
      } else if (isLimitOrderCreatedMessage(parsedMessage)) {
        if (!address || address !== parsedMessage.data.obj.traderAddr) {
          return;
        }

        getOpenOrders(parsedMessage.data.obj.symbol, address).then(({ data }) => {
          setOpenOrders(data);
        });
      } else if (isPerpetualLimitOrderCancelledMessage(parsedMessage)) {
        if (!address || address !== parsedMessage.data.obj.traderAddr) {
          return;
        }

        removeOpenOrder(parsedMessage.data.obj.orderId);
      } else if (isTradeMessage(parsedMessage)) {
        if (!address || address !== parsedMessage.data.obj.traderAddr) {
          return;
        }

        getOpenOrders(parsedMessage.data.obj.symbol, address).then(({ data }) => {
          setOpenOrders(data);
        });
      }
    },
    [updatePerpetualStats, setWebSocketReady, setPositions, setOpenOrders, removeOpenOrder, address]
  );
}