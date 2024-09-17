import { useAtom, useAtomValue } from 'jotai';
import { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonMenuItem } from 'components/button-select/elements/ButtonMenuItem';
import { ButtonSelect } from 'components/button-select/ButtonSelect';
import { defaultCurrencyAtom } from 'store/app.store';
import { selectedPerpetualAtom, selectedPoolAtom } from 'store/pools.store';
import { DefaultCurrencyE } from 'types/enums';
import type { TemporaryAnyT } from 'types/types';
import { getDynamicLogo } from 'utils/getDynamicLogo';

import styles from './DefaultCurrencySelect.module.scss';

const optionsArray = Object.values(DefaultCurrencyE);

interface OptionTitlePropsI {
  option: string;
  currency: string;
}

const OptionTitle = ({ option, currency }: OptionTitlePropsI) => {
  const IconComponent = useMemo(() => getDynamicLogo(currency.toLowerCase()) as TemporaryAnyT, [currency]);
  return (
    <span className={styles.currencyLabel}>
      <Suspense fallback={null}>
        <IconComponent width={16} height={16} />
      </Suspense>
      <span>{option}</span>
    </span>
  );
};

export const DefaultCurrencySelect = () => {
  const { t } = useTranslation();

  const [defaultCurrency, setDefaultCurrency] = useAtom(defaultCurrencyAtom);
  const selectedPool = useAtomValue(selectedPoolAtom);
  const selectedPerpetual = useAtomValue(selectedPerpetualAtom);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currenciesMap: Record<DefaultCurrencyE, string> = useMemo(() => {
    if (!selectedPool || !selectedPerpetual) {
      return {
        [DefaultCurrencyE.Base]: '',
        [DefaultCurrencyE.Quote]: '',
        [DefaultCurrencyE.Pool]: '',
      };
    }

    return {
      [DefaultCurrencyE.Base]: selectedPerpetual.baseCurrency,
      [DefaultCurrencyE.Quote]: selectedPerpetual.quoteCurrency,
      [DefaultCurrencyE.Pool]: selectedPool.settleSymbol,
    };
  }, [selectedPool, selectedPerpetual]);

  const IconComponent = useMemo(
    () => getDynamicLogo(currenciesMap[defaultCurrency].toLowerCase()) as TemporaryAnyT,
    [defaultCurrency, currenciesMap]
  );

  return (
    <ButtonSelect
      id="default-currency-select"
      selectedValue={
        <span className={styles.currencyLabel}>
          <Suspense fallback={null}>
            <IconComponent width={16} height={16} />
          </Suspense>
          <span>{t(`common.settings.ui-settings.default-currency.${defaultCurrency}`)}</span>
        </span>
      }
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
    >
      {optionsArray.map((option) => (
        <ButtonMenuItem
          key={option}
          option={
            <OptionTitle
              option={t(`common.settings.ui-settings.default-currency.${option}`)}
              currency={currenciesMap[option]}
            />
          }
          isActive={option === defaultCurrency}
          onClick={() => {
            setDefaultCurrency(option);
            setAnchorEl(null);
          }}
        />
      ))}
    </ButtonSelect>
  );
};