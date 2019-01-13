export const computeTabAttributes = (tabId, selectTab, cssClass) => {
  // https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-1/tabs.html
  const isSelected = selectTab === tabId;

  let values = {
    id: tabId,
    'aria-controls': '#' + tabId + '-tab',
    'aria-selected': isSelected,
    className: cssClass
  };
  if (!isSelected) values.tabIndex = -1;

  return values;
}

export const computeTabPanelAttributes = (tabId, extraCssClass="") => {
  // https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-1/tabs.html
  return {
    className: extraCssClass ? 'tab-content '+ extraCssClass : 'tab-content',
    role: 'tabpanel',
    tabIndex: 0,
    id: tabId + '-tab',
    'aria-labelledby': tabId
  };
}