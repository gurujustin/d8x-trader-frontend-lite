import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Address } from 'viem';

import { DropDownMenuItem } from 'components/dropdown-select/components/DropDownMenuItem';
import { DropDownSelect } from 'components/dropdown-select/DropDownSelect';
import { SidesRow } from 'components/sides-row/SidesRow';
import { modalSelectedCurrencyAtom } from 'store/global-modals.store';
import { gasTokenSymbolAtom, poolsAtom } from 'store/pools.store';

import { CurrencyItemI } from './types';

export const CurrencySelect = () => {
  const { t } = useTranslation();

  const [selectedCurrency, setSelectedCurrency] = useAtom(modalSelectedCurrencyAtom);
  const pools = useAtomValue(poolsAtom);
  const gasTokenSymbol = useAtomValue(gasTokenSymbolAtom);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currencyItems = useMemo(() => {
    const currencies: CurrencyItemI[] = [];

    if (gasTokenSymbol) {
      currencies.push({ id: gasTokenSymbol, name: gasTokenSymbol, isGasToken: true, isActiveToken: true });
    }

    if (pools.length) {
      const activePools = pools.filter((pool) => pool.isRunning);
      activePools.forEach((pool) =>
        currencies.push({
          id: `${pool.poolId}`,
          name: pool.poolSymbol,
          isGasToken: false,
          isActiveToken: true,
          contractAddress: pool.marginTokenAddr as Address, // @TODO: used to show pool info -> use settlement token
        })
      );

      const inactivePools = pools.filter((pool) => !pool.isRunning);
      inactivePools.forEach((pool) =>
        currencies.push({
          id: `${pool.poolId}`,
          name: pool.poolSymbol,
          isGasToken: false,
          isActiveToken: false,
          contractAddress: pool.marginTokenAddr as Address, // @TODO: idem
        })
      );
    }

    return currencies;
  }, [gasTokenSymbol, pools]);

  useEffect(() => {
    if (currencyItems.length > 0) {
      setSelectedCurrency(currencyItems[0]);
    }
  }, [currencyItems, setSelectedCurrency]);

  return (
    <SidesRow
      leftSide={t('common.currency-label')}
      rightSide={
        <DropDownSelect
          id="currency-dropdown"
          selectedValue={selectedCurrency?.name}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          fullWidth
        >
          {currencyItems.map((item) => (
            <DropDownMenuItem
              key={item.id}
              option={item.name}
              isActive={item.id === selectedCurrency?.id}
              onClick={() => {
                setSelectedCurrency(item);
                setAnchorEl(null);
              }}
            />
          ))}
        </DropDownSelect>
      }
    />
  );
};
