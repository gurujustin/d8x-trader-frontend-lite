import classNames from 'classnames';
import { useAtom, useSetAtom } from 'jotai';
import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { orderInfoAtom, takeProfitAtom, takeProfitPriceAtom } from 'store/order-block.store';
import { selectedPerpetualAtom } from 'store/pools.store';
import { OrderBlockE, TakeProfitE } from 'types/enums';
import { mapCurrencyToFractionDigits } from 'utils/formatToCurrency';

import commonStyles from '../../OrderBlock.module.scss';
import styles from './TakeProfitSelector.module.scss';

export const TakeProfitSelector = memo(() => {
  const { t } = useTranslation();
  const [orderInfo] = useAtom(orderInfoAtom);
  const [takeProfit, setTakeProfit] = useAtom(takeProfitAtom);
  const setTakeProfitPrice = useSetAtom(takeProfitPriceAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);

  const [takeProfitInputPrice, setTakeProfitInputPrice] = useState<number | null>(null);

  const currentOrderBlockRef = useRef(orderInfo?.orderBlock);
  const currentLeverageRef = useRef(orderInfo?.leverage);

  const handleTakeProfitPriceChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const takeProfitPriceValue = event.target.value;
    if (takeProfitPriceValue !== '') {
      setTakeProfitInputPrice(+takeProfitPriceValue);
      setTakeProfit(null);
    } else {
      setTakeProfitInputPrice(null);
    }
  };

  const handleTakeProfitChange = (takeProfitValue: TakeProfitE) => {
    setTakeProfitPrice(null);
    setTakeProfitInputPrice(null);
    setTakeProfit(takeProfitValue);
  };

  const minTakeProfitPrice = useMemo(() => {
    if (orderInfo?.midPrice && orderInfo.orderBlock === OrderBlockE.Long) {
      return orderInfo.midPrice;
    }
    return 0;
  }, [orderInfo?.midPrice, orderInfo?.orderBlock]);

  const maxTakeProfitPrice = useMemo(() => {
    if (orderInfo?.midPrice && orderInfo.orderBlock === OrderBlockE.Short) {
      return orderInfo.midPrice;
    }
    return undefined;
  }, [orderInfo?.midPrice, orderInfo?.orderBlock]);

  const fractionDigits = useMemo(() => {
    if (selectedPerpetual?.quoteCurrency) {
      const foundFractionDigits = mapCurrencyToFractionDigits[selectedPerpetual.quoteCurrency];
      return foundFractionDigits !== undefined ? foundFractionDigits : 2;
    }
    return 2;
  }, [selectedPerpetual?.quoteCurrency]);

  const stepSize = useMemo(() => {
    if (!selectedPerpetual?.indexPrice) {
      return '1';
    }
    return `${1 / 10 ** Math.ceil(2.5 - Math.log10(selectedPerpetual.indexPrice))}`;
  }, [selectedPerpetual?.indexPrice]);

  const validateTakeProfitPrice = useCallback(() => {
    if (takeProfitInputPrice === null) {
      setTakeProfitPrice(null);
      setTakeProfit(TakeProfitE.None);
      return;
    }

    if (maxTakeProfitPrice && takeProfitInputPrice > maxTakeProfitPrice) {
      const maxTakeProfitPriceRounded = +maxTakeProfitPrice.toFixed(fractionDigits);
      setTakeProfitPrice(maxTakeProfitPriceRounded);
      setTakeProfitInputPrice(maxTakeProfitPriceRounded);
      return;
    }
    if (takeProfitInputPrice < minTakeProfitPrice) {
      const minTakeProfitPriceRounded = +minTakeProfitPrice.toFixed(fractionDigits);
      setTakeProfitPrice(minTakeProfitPriceRounded);
      setTakeProfitInputPrice(minTakeProfitPriceRounded);
      return;
    }

    setTakeProfitPrice(takeProfitInputPrice);
  }, [minTakeProfitPrice, maxTakeProfitPrice, takeProfitInputPrice, setTakeProfit, setTakeProfitPrice, fractionDigits]);

  useEffect(() => {
    if (currentOrderBlockRef.current !== orderInfo?.orderBlock) {
      currentOrderBlockRef.current = orderInfo?.orderBlock;

      setTakeProfitPrice(null);
      setTakeProfitInputPrice(null);

      if (orderInfo?.takeProfit === null) {
        setTakeProfit(TakeProfitE.None);
      }
    }
  }, [orderInfo?.orderBlock, orderInfo?.takeProfit, setTakeProfitPrice, setTakeProfit]);

  useEffect(() => {
    if (currentLeverageRef.current !== orderInfo?.leverage) {
      currentLeverageRef.current = orderInfo?.leverage;

      validateTakeProfitPrice();
    }
  }, [orderInfo?.leverage, validateTakeProfitPrice]);

  useEffect(() => {
    if (takeProfit && takeProfit !== TakeProfitE.None && orderInfo?.takeProfitPrice) {
      setTakeProfitInputPrice(Math.max(0, +orderInfo.takeProfitPrice.toFixed(fractionDigits)));
    }
  }, [takeProfit, orderInfo?.takeProfitPrice, fractionDigits]);

  const translationMap: Record<TakeProfitE, string> = {
    [TakeProfitE.None]: t('pages.trade.order-block.take-profit.none'),
    [TakeProfitE['25%']]: '35%',
    [TakeProfitE['50%']]: '50%',
    [TakeProfitE['100%']]: '100%',
    [TakeProfitE['500%']]: '500%',
  };

  return (
    <Box className={styles.root}>
      <Box className={styles.labelHolder}>
        <Box className={styles.label}>
          <InfoBlock
            title={t('pages.trade.order-block.take-profit.title')}
            content={
              <>
                <Typography>{t('pages.trade.order-block.take-profit.body1')}</Typography>
                <Typography>{t('pages.trade.order-block.take-profit.body2')}</Typography>
                <Typography>{t('pages.trade.order-block.take-profit.body3')}</Typography>
              </>
            }
            classname={commonStyles.actionIcon}
          />
        </Box>
        <OutlinedInput
          id="custom-take-profit-price"
          className={styles.customPriceInput}
          endAdornment={
            <InputAdornment position="end">
              <Typography variant="adornment">{selectedPerpetual?.quoteCurrency}</Typography>
            </InputAdornment>
          }
          type="number"
          value={takeProfitInputPrice || ''}
          placeholder="-"
          onChange={handleTakeProfitPriceChange}
          onBlur={validateTakeProfitPrice}
          inputProps={{ step: stepSize }}
        />
      </Box>
      <Box className={styles.takeProfitOptions}>
        {Object.values(TakeProfitE).map((key) => (
          <Button
            key={key}
            variant="outlined"
            className={classNames({ [styles.selected]: key === takeProfit })}
            onClick={() => handleTakeProfitChange(key)}
          >
            {translationMap[key]}
          </Button>
        ))}
      </Box>
    </Box>
  );
});
