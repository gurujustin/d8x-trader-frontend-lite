import { config } from 'config';
import { getRequestOptions } from 'helpers/getRequestOptions';
import { EarnedRebateI, OpenTraderRebateI, ReferralCodeI, ReferralVolumeI, ValidatedResponseI } from '../types/types';
import { RebateTypeE } from '../types/enums';

function getReferralUrlByChainId(chainId: number) {
  return config.referralUrl[`${chainId}`] || config.referralUrl.default;
}

export function getCodeExists(chainId: number, code: string): Promise<ValidatedResponseI<{ code: string }[]>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/code-info?code=${code}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getIsAgency(chainId: number, address: string): Promise<ValidatedResponseI<{ isAgency: boolean }>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/is-agency?addr=${address}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getReferralVolume(chainId: number, address: string): Promise<ValidatedResponseI<ReferralVolumeI[]>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/referral-volume?referrerAddr=${address}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getEarnedRebate(
  chainId: number,
  address: string,
  rebateType: RebateTypeE
): Promise<ValidatedResponseI<EarnedRebateI[]>> {
  const params = new URLSearchParams();
  params.append(`${rebateType}Addr`, address);

  return fetch(`${getReferralUrlByChainId(chainId)}/earned-rebate?${params}`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}

export function getReferralCodes(chainId: number, address: string): Promise<ValidatedResponseI<ReferralCodeI>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/my-referral-codes?addr=${address}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getOpenTraderRebate(
  chainId: number,
  traderAddr: string
): Promise<ValidatedResponseI<OpenTraderRebateI[]>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/open-trader-rebate?addr=${traderAddr}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getReferralRebate(chainId: number, address: string): Promise<ValidatedResponseI<ReferralCodeI>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/referral-rebate?referrerAddr=${address}`, getRequestOptions()).then(
    (data) => {
      if (!data.ok) {
        console.error({ data });
        throw new Error(data.statusText);
      }
      return data.json();
    }
  );
}

export function getAgencyRebate(chainId: number): Promise<ValidatedResponseI<ReferralCodeI>> {
  return fetch(`${getReferralUrlByChainId(chainId)}/agency-rebate`, getRequestOptions()).then((data) => {
    if (!data.ok) {
      console.error({ data });
      throw new Error(data.statusText);
    }
    return data.json();
  });
}
