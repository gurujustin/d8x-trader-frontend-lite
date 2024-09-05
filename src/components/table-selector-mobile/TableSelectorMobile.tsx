import { useEffect, useRef, useState } from 'react';

import { MenuItem } from '@mui/material';

import { DropDownSelect } from 'components/dropdown-select/DropDownSelect';
import { type SelectorItemI } from 'components/table-selector/TableSelector';
import { Filter } from 'components/table-selector/elements/filter/Filter';
import { Refresher } from 'components/table-selector/elements/refresher/Refresher';
import { FilterModalProvider } from 'components/table/filter-modal/FilterModalContext';

import styles from './TableSelectorMobile.module.scss';
import { useAtomValue } from 'jotai';
import { triggerScrollToTablesAtom } from '../../store/pools.store';

interface TableSelectorMobilePropsI {
  selectorItems: SelectorItemI[];
}

export const TableSelectorMobile = ({ selectorItems }: TableSelectorMobilePropsI) => {
  const triggerScrollToTables = useAtomValue(triggerScrollToTablesAtom);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(2);
    blockRef.current?.scrollIntoView();
  }, [triggerScrollToTables]);

  return (
    <FilterModalProvider>
      <div className={styles.root} ref={blockRef}>
        <div className={styles.dropdownHolder}>
          <DropDownSelect
            id="table-selector-dropdown"
            selectedValue={selectorItems[selectedIndex]?.label}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            fullWidth
          >
            {selectorItems.map(({ label }, index) => (
              <MenuItem
                key={label}
                value={index}
                className={styles.dropdown}
                onClick={() => {
                  setSelectedIndex(index);
                  setAnchorEl(null);
                }}
              >
                {label}
              </MenuItem>
            ))}
          </DropDownSelect>
        </div>
        <div className={styles.buttonsBlock}>
          <Filter activeTableType={selectorItems[selectedIndex].tableType} />
          <Refresher activeTableType={selectorItems[selectedIndex].tableType} />
        </div>
        <div>{selectorItems[selectedIndex].item}</div>
      </div>
    </FilterModalProvider>
  );
};
