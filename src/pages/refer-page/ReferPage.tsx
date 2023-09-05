import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';

import { Box } from '@mui/material';

import { Container } from 'components/container/Container';
import { useQuery } from 'hooks/useQuery';
import { getIsAgency, getReferralCodes } from 'network/referral';
import { isAgencyAtom, referralCodeAtom, referralCodesRefetchHandlerRefAtom } from 'store/refer.store';

import { ReferrerTab } from './components/referrer-tab/ReferrerTab';
import { TabSelector } from './components/tab-selector/TabSelector';
import { TraderTab } from './components/trader-tab/TraderTab';
import { QueryParamE, ReferTabIdE } from './constants';

import styles from './ReferPage.module.scss';

const tabComponents = [
  {
    tabId: ReferTabIdE.Trader,
    content: <TraderTab key={ReferTabIdE.Trader} />,
  },
  {
    tabId: ReferTabIdE.Referral,
    content: <ReferrerTab key={ReferTabIdE.Referral} />,
  },
];

const queryParamToReferTabIdMap: Record<string, ReferTabIdE> = {
  trader: ReferTabIdE.Trader,
  referral: ReferTabIdE.Referral,
};

export const ReferPage = () => {
  const [activeTabId, setActiveTabId] = useState(ReferTabIdE.Trader);

  const setIsAgency = useSetAtom(isAgencyAtom);
  const setReferralCode = useSetAtom(referralCodeAtom);
  const setReferralCodesRefetchHandler = useSetAtom(referralCodesRefetchHandlerRefAtom);

  const chainId = useChainId();
  const { address } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();

  const query = useQuery();

  const referralCodesRequestRef = useRef(false);
  const isAgencyRequestRef = useRef(false);

  const handleTabChange = useCallback(
    (tabId: ReferTabIdE) => {
      setActiveTabId(tabId);

      query.set(QueryParamE.Tab, tabId);

      const newQuery = query.toString();
      const paramsStr = newQuery ? `?${newQuery}` : '';

      navigate(`${location.pathname}${paramsStr}${location.hash}`);
    },
    [navigate, location, query]
  );

  const refreshReferralCodes = useCallback(() => {
    if (referralCodesRequestRef.current || !chainId || !address) {
      return;
    }

    referralCodesRequestRef.current = true;

    getReferralCodes(chainId, address)
      .then(({ data }) => {
        setReferralCode(data);
      })
      .catch(console.error)
      .finally(() => {
        referralCodesRequestRef.current = false;
      });
  }, [address, chainId, setReferralCode]);

  useEffect(() => {
    setReferralCodesRefetchHandler({ handleRefresh: refreshReferralCodes });
  }, [refreshReferralCodes, setReferralCodesRefetchHandler]);

  useEffect(() => {
    refreshReferralCodes();
  }, [refreshReferralCodes]);

  useEffect(() => {
    if (isAgencyRequestRef.current || !chainId || !address) {
      return;
    }

    isAgencyRequestRef.current = false;

    getIsAgency(chainId, address)
      .then(({ data }) => {
        setIsAgency(data.isAgency);
      })
      .catch(console.error)
      .finally(() => {
        isAgencyRequestRef.current = false;
      });
  }, [chainId, address, setIsAgency]);

  useEffect(() => {
    const tabId = query.get(QueryParamE.Tab);
    if (!tabId) {
      return;
    }

    const referTabId = queryParamToReferTabIdMap[tabId];
    if (!referTabId) {
      return;
    }

    setActiveTabId(referTabId);
  }, [query]);

  return (
    <Box className={styles.root}>
      <Container className={styles.container}>
        <TabSelector activeTab={activeTabId} onTabChange={handleTabChange} />
        {tabComponents.find(({ tabId }) => tabId === activeTabId)?.content}
      </Container>
    </Box>
  );
};
