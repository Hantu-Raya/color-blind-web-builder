const wash = (file, selector, alpha = 100) => ({ file, selector, prop: "wash-color", alpha });
const bg = (file, selector, alpha = 100) => ({ file, selector, prop: "background-color", alpha });
const text = (file, selector, alpha = 100) => ({ file, selector, prop: "color", alpha });
const opacity = (file, selector, value) => ({ file, selector, prop: "opacity", fixedValue: value });
const saturation = (file, selector, value) => ({ file, selector, prop: "saturation", fixedValue: value });
const brightness = (file, selector, value) => ({ file, selector, prop: "brightness", fixedValue: value });
const fixed = (file, selector, prop, value) => ({ file, selector, prop, fixedValue: value });
const gradient = (file, selector, alpha = 100) => ({ file, selector, prop: "background-color", alpha, format: "gradient" });
const topBarBadgeBackground = (...teams) => teams
  .map((team) => `${team} CitadelHeroBadge.TopBar .BadgeBackground`)
  .join(",");
const topBarCoinBackground = (...teams) => teams
  .flatMap((team) => [
    `${team} CitadelHudTopBarPlayer .HeroContentsCoinBackground`,
    `${team} CitadelHudTopBarPlayer.SpectatorTarget .HeroContentsCoinBackground`,
    `${team} CitadelHudTopBarPlayer.LocalPlayer .HeroContentsCoinBackground`,
    `${team} CitadelHudTopBarPlayer.IsInLocalPlayerLane .HeroContentsCoinBackground`
  ])
  .join(",");

const SHOP_READABLE_ITEM_TEXT_SELECTOR = [
  "#CitadelHudHeroShop CitadelShopMod .modName",
  "#CitadelHudHeroShop CitadelShopMod .ItemName",
  "#CitadelHudHeroShop CitadelShopMod .boldedText"
].join(",");

const SHOP_READABLE_TIER_SELECTOR = "#CitadelHudHeroShop CitadelShopMod #mod_tier_label";

export const STYLE_FILES = [
  "ability_hud_elements/element_roll.css",
  "ability_hud_elements/element_sprint.css",
  "citadel_hud_data_feed_info.css",
  "citadel_hud_hero_shop.css",
  "citadel_hud_shop_quickbuy.css",
  "citadel_hud_top_bar.css",
  "citadel_shop_mod_icon.css",
  "citadel_shop_mod_view.css",
  "hud_abilities.css",
  "hud_ability_icon.css",
  "hud_ability_icon_active.css",
  "hud_ability_icon_passive.css",
  "hud_damage_impact.css",
  "hud_gold_and_ap_container.css",
  "hud_minimap.css",
  "hud_objective_health.css",
  "hud_quickbuy.css",
  "hud_quickbuy_entry.css",
  "unit_status.css"
];

export const ROLE_CATEGORIES = [
  { id: "combat", label: "Combat" },
  { id: "team", label: "Team cues" },
  { id: "abilities", label: "Abilities" },
  { id: "shop", label: "Shop" },
  { id: "map", label: "Map and lanes" },
  { id: "system", label: "Neutral states" }
];

export const COLOR_ROLES = [
  {
    id: "enemy",
    category: "combat",
    label: "Enemy main",
    description: "Enemy health, objective health, death feed, minimap enemies, and hostile HUD status.",
    defaultColor: "#F0E442",
    defaultWash: 100,
    targets: [
      wash("unit_status.css", ".enemy #unit_ult_ready_icon"),
      wash("unit_status.css", ".enemy #unit_healthbar_lagging"),
      bg("unit_status.css", ".enemy #unit_healthbar_bullet_shield"),
      wash("unit_status.css", ".enemy #state_progressbar"),
      wash("unit_status.css", ".enemy #pip_image"),
      bg("citadel_hud_top_bar.css", ".team2 #HeroHealth_Left"),
      bg("citadel_hud_top_bar.css", ".enemy #HeroHealth_Left,.team1.enemy #HeroHealth_Left,.team2.enemy #HeroHealth_Left"),
      bg("citadel_hud_top_bar.css", topBarBadgeBackground(".team2", ".enemy")),
      wash("citadel_hud_top_bar.css", topBarCoinBackground(".team2", ".enemy")),
      wash("citadel_hud_top_bar.css", ".team2 .ScoreBG,.team2 .HeroContentsCoinBackground,.team2 .HeroContentsCoinInnerBorder"),
      wash("citadel_hud_top_bar.css", ".enemy .ScoreBG,.enemy .HeroContentsCoinBackground,.enemy .HeroContentsCoinInnerBorder"),
      wash("hud_minimap.css", ".map_button.idol_return_enemy .idolReturnTarget"),
      wash("hud_minimap.css", ".map_button.enemy.boss .boss_image"),
      bg("hud_minimap.css", ".enemy.player #BackgroundImage,.map_button.enemy.player #BackgroundImage"),
      wash("hud_minimap.css", ".map_button.boss.team2 .boss_image"),
      bg("hud_objective_health.css", "#healthbar_progress .ProgressBarLeft"),
      bg("hud_damage_impact.css", "#healthRemaining"),
      wash("hud_damage_impact.css", "#heroIcon.heroDead"),
      wash("hud_damage_impact.css", ".killed #heroBadge,.assist #heroBadge,.killed #heroIconContainer,.assist #heroIconContainer"),
      text("hud_damage_impact.css", ".killLabel,.assistLabel"),
      bg("citadel_hud_data_feed_info.css", ".enemyDied .victimContainer,.teammateDied .killerContainer")
    ]
  },
  {
    id: "enemyDelta",
    category: "combat",
    label: "Enemy damage delta",
    description: "Recent damage, danger prices, missing components, and destructive shop cues.",
    defaultColor: "#D55E00",
    defaultWash: 100,
    targets: [
      wash("unit_status.css", ".enemy #unit_healthbar_delta"),
      bg("hud_objective_health.css", ".on_damaged #healthbar_progress .ProgressBarMiddle"),
      text("citadel_hud_shop_quickbuy.css", ".nextModCost Label"),
      text("citadel_shop_mod_view.css", "#ItemCost"),
      text("citadel_shop_mod_view.css", "#CantAfford,#ComponentNotOwned"),
      wash("citadel_shop_mod_view.css", ".sellWillDestroyItem.owned #background:hover .destroyIcon"),
      wash("citadel_shop_mod_view.css", ".componentsNotOwned .componentNotOwnedIcon"),
      text("hud_gold_and_ap_container.css", ".death_penalty_gold_danger_level_4 .death_penalty_gold,.death_penalty_gold_danger_level_3 .death_penalty_gold"),
      text("hud_quickbuy_entry.css", ".QuickbuyItem .CostPanel #ModCost"),
      wash("hud_quickbuy_entry.css", ".QuickbuyItem .CostPanel .goldIcon")
    ]
  },
  {
    id: "friend",
    category: "team",
    label: "Friendly main",
    description: "Friendly health, top bar, minimap friends, and positive team identity.",
    defaultColor: "#0072B2",
    defaultWash: 100,
    targets: [
      wash("unit_status.css", ".friend #unit_ult_ready_icon"),
      wash("unit_status.css", ".friend #unit_healthbar_lagging"),
      bg("unit_status.css", ".friend #unit_healthbar_bullet_shield"),
      wash("unit_status.css", ".friend #state_progressbar"),
      wash("unit_status.css", ".friend #pip_image"),
      bg("citadel_hud_top_bar.css", ".team1 #HeroHealth_Left"),
      bg("citadel_hud_top_bar.css", ".friend #HeroHealth_Left,.team1.friend #HeroHealth_Left,.team2.friend #HeroHealth_Left"),
      bg("citadel_hud_top_bar.css", topBarBadgeBackground(".team1", ".friend")),
      wash("citadel_hud_top_bar.css", topBarCoinBackground(".team1", ".friend")),
      wash("citadel_hud_top_bar.css", ".team1 .ScoreBG,.team1 .HeroContentsCoinBackground,.team1 .HeroContentsCoinInnerBorder"),
      wash("citadel_hud_top_bar.css", ".friend .ScoreBG,.friend .HeroContentsCoinBackground,.friend .HeroContentsCoinInnerBorder"),
      wash("hud_minimap.css", ".map_button.idol_return_friendly .idolReturnTarget,.map_button.friend.boss .boss_image"),
      bg("hud_minimap.css", ".friend.player #BackgroundImage,.map_button.friend.player #BackgroundImage"),
      wash("hud_minimap.css", ".map_button.boss.team1 .boss_image"),
      bg("hud_objective_health.css", ".friend #healthbar_progress .ProgressBarLeft"),
      bg("citadel_hud_data_feed_info.css", ".enemyDied .killerContainer,.teammateDied .victimContainer"),
      bg("citadel_hud_data_feed_info.css", "CitadelHeroImage.assister", 25)
    ]
  },
  {
    id: "friendAccent",
    category: "team",
    label: "Friendly accent",
    description: "Friendly damage delta, quickbuy readiness, and blue lane contrast.",
    defaultColor: "#56B4E9",
    defaultWash: 100,
    targets: [
      wash("unit_status.css", ".friend #unit_healthbar_delta"),
      bg("citadel_hud_shop_quickbuy.css", "CitadelHudQuickBuy.canAfford", 25),
      bg("citadel_hud_shop_quickbuy.css", "CitadelHudQuickBuy.canAfford:Hover", 45),
      wash("citadel_shop_mod_view.css", ".canAffordMod #CardBacker"),
      wash("citadel_shop_mod_view.css", ".quickbuy .quickbuy_icon"),
      bg("citadel_shop_mod_view.css", ".owned.quickbuy .modStatusCol"),
      text("citadel_shop_mod_view.css", ".canAffordMod .BuyLabel"),
      bg("hud_quickbuy.css", ".ItemsReady #HudMini", 45),
      bg("hud_quickbuy.css", ".CanBuyItemsHighlight", 40),
      text("hud_quickbuy.css", "#QuickbuyShopSummary .ItemsReadyLabel")
    ]
  },
  {
    id: "positive",
    category: "abilities",
    label: "Ready and owned",
    description: "Active abilities, heal gain, owned shop states, armor category, and sprint/roll elements.",
    defaultColor: "#009E73",
    defaultWash: 100,
    targets: [
      wash("hud_abilities.css", ".active .ability_bg,.active .ability_ring,.channeling .ability_bg,.channeling .ability_ring"),
      wash("hud_abilities.css", ".active .ability_key_container,.channeling .ability_key_container"),
      wash("hud_ability_icon.css", ".active .ability_bg,.active .ability_ring,.channeling .ability_bg,.channeling .ability_ring,.toggled_on .ability_bg,.toggled_on .ability_ring"),
      wash("hud_ability_icon.css", ".active .ability_key_container,.toggled_on .ability_key_container,.channeling .ability_key_container"),
      wash("hud_ability_icon_active.css", ".active .ability_bg,.active .ability_ring,.active .button_container"),
      wash("hud_ability_icon_passive.css", ".active .ability_bg,.active .ability_ring,.channeling .ability_bg,.channeling .ability_ring"),
      wash("ability_hud_elements/element_roll.css", "#charges_container"),
      bg("ability_hud_elements/element_sprint.css", "#circular_progress"),
      wash("ability_hud_elements/element_sprint.css", "#ability_icon"),
      bg("hud_damage_impact.css", ".is_heal #healthRemaining"),
      bg("hud_damage_impact.css", "#healthGained"),
      bg("citadel_hud_top_bar.css", ".UltimateCooldownReady .UltimateStatusBG", 45),
      wash("citadel_hud_top_bar.css", ".UltimateCooldownReady .UltimateStatus"),
      wash("citadel_shop_mod_icon.css", ".isArmor .tier_bg"),
      bg("citadel_shop_mod_icon.css", ".isArmor .mod_icon_single_container,#BuyNextButton .isArmor .mod_icon_single_container"),
      text("citadel_shop_mod_view.css", ".isArmor .boldedText,.isArmor .modName,.isArmor .ItemName,.isArmor #mod_tier_label"),
      wash("citadel_shop_mod_view.css", ".isArmor .mod_icon,.isArmor #ModIconImage,.isArmorComponent #componentModIcon,.isArmor .tier_bg"),
      bg("citadel_shop_mod_view.css", "#CitadelHudHeroShop CitadelShopMod.owned #CardBacker,#CitadelHudHeroShop CitadelShopMod.usedAsComponent #CardBacker"),
      bg("citadel_shop_mod_view.css", ".owned .modStatusCol,.usedAsComponent .modStatusCol"),
      wash("citadel_shop_mod_view.css", ".owned .purchasedIcon,.usedAsComponent .purchasedIcon"),
      wash("citadel_shop_mod_view.css", ".componentOwned #componentOwnedIcon"),
      wash("citadel_shop_mod_view.css", ".componentOwned #componentModIcon,.owned #componentModIcon")
    ]
  },
  {
    id: "upgrade",
    category: "abilities",
    label: "Upgrade available",
    description: "Ability upgrades, AP, recommended items, sell action, and new item wash.",
    defaultColor: "#CC79A7",
    defaultWash: 100,
    targets: [
      wash("hud_abilities.css", ".ability_upgradable .ability_ring,.ability_upgradable .button_container,.learning_ability .ability_key,.ability_upgradable .ability_key"),
      text("hud_abilities.css", ".ability_upgradable .ability_ring,.ability_upgradable .button_container,.learning_ability .ability_key,.ability_upgradable .ability_key"),
      wash("hud_ability_icon.css", ".ability_upgradable .ability_ring,.ability_upgrade_available .ability_bg,.ability_upgradable .button_container"),
      text("hud_ability_icon.css", ".learning_ability .ability_key,.ability_upgradable .ability_key"),
      wash("hud_ability_icon_passive.css", ".ability_upgradable .ability_ring,.ability_upgradable .button_container"),
      wash("hud_ability_icon.css", ".new_item .button_container", 80),
      wash("hud_abilities.css", ".new_item .button_container", 80),
      wash("citadel_hud_hero_shop.css", ".ap_image,.abilityPointIcon"),
      text("citadel_hud_hero_shop.css", ".currency_ap"),
      text("hud_gold_and_ap_container.css", "#HudCurrentAPContainer .CurrencyLabel,#hudAPPointsAvailable,#hudAPInfinite"),
      wash("citadel_shop_mod_view.css", ".recommended .recommended_icon"),
      wash("hud_quickbuy_entry.css", ".QuickbuyItem.Sell")
    ]
  },
  {
    id: "economy",
    category: "shop",
    label: "Souls and gold",
    description: "Gold icons, souls, purchasable costs, weapon category, and shop tunnel cues.",
    defaultColor: "#E69F00",
    defaultWash: 100,
    targets: [
      text("citadel_hud_hero_shop.css", "#SoulAmount,#SoulAmount Label,#SoulRewards Label,.currency_gold"),
      wash("citadel_hud_hero_shop.css", ".SoulsImage,.currency_image,.currency_gold .currency_image"),
      bg("citadel_hud_hero_shop.css", "#SoulRewards"),
      bg("citadel_hud_hero_shop.css", ".WeaponMod .ModifiedHeaderContainer,#WeaponModsButton,.showingWeapon #WeaponModsButton"),
      wash("citadel_hud_hero_shop.css", ".isWeaponPurchase .mod_icon"),
      wash("citadel_hud_top_bar.css", ".goldIcon.PlayerGoldIcon,.goldIcon.TeamGoldIcon"),
      text("citadel_hud_top_bar.css", ".SoulsValue"),
      text("citadel_hud_shop_quickbuy.css", ".canAfford .nextModCost Label,.itemPurchase"),
      wash("citadel_hud_shop_quickbuy.css", ".nextModGoldIcon"),
      bg("citadel_shop_mod_icon.css", ".isWeapon .mod_icon_single_container,#BuyNextButton .isWeapon .mod_icon_single_container"),
      wash("citadel_shop_mod_icon.css", ".isWeapon .tier_bg"),
      text("citadel_shop_mod_view.css", ".isWeapon .boldedText,.isWeapon .modName,.isWeapon .ItemName,.isWeapon #mod_tier_label"),
      wash("citadel_shop_mod_view.css", ".isWeapon .mod_icon,.isWeapon #ModIconImage,.isWeaponComponent #componentModIcon,.isWeapon .tier_bg"),
      text("citadel_shop_mod_view.css", ".canAffordMod #ItemCost"),
      wash("citadel_shop_mod_view.css", "#ItemCostContainer .goldIcon,#SellOverlay .goldIcon"),
      text("hud_gold_and_ap_container.css", ".CurrencyLabel,#hudGoldLabel,.death_penalty_gold,#hudDealthGoldLabel"),
      wash("hud_gold_and_ap_container.css", "#hudCurGoldIcon,#hudDeathGoldIcon,.goldIcon"),
      wash("hud_minimap.css", ".map_button.shop_tunnel,.map_button.tier1_shop,.map_button.shop"),
      text("hud_quickbuy.css", "#QuickbuyShopSummary .ShopSummaryLabel"),
      text("hud_quickbuy_entry.css", ".QuickbuyItem.CanAffordCumulative .CostPanel #ModCost"),
      wash("hud_quickbuy_entry.css", ".QuickbuyItem.CanAffordCumulative .CostPanel .goldIcon"),
      gradient("hud_quickbuy_entry.css", ".QuickbuyItem.IsBeingDragged.isWeapon")
    ]
  },
  {
    id: "tech",
    category: "shop",
    label: "Tech category",
    description: "Tech mods, tech headers, and blue shop category markings.",
    defaultColor: "#0072B2",
    defaultWash: 100,
    targets: [
      bg("citadel_hud_hero_shop.css", ".TechMod .ModifiedHeaderContainer,#TechModsButton,.showingTech #TechModsButton"),
      wash("citadel_hud_hero_shop.css", ".isTechPurchase .mod_icon"),
      bg("citadel_shop_mod_icon.css", ".isTech .mod_icon_single_container,#BuyNextButton .isTech .mod_icon_single_container"),
      wash("citadel_shop_mod_icon.css", ".isTech .tier_bg"),
      text("citadel_shop_mod_view.css", ".isTech .boldedText,.isTech .modName,.isTech .ItemName,.isTech #mod_tier_label"),
      wash("citadel_shop_mod_view.css", ".isTech .mod_icon,.isTech #ModIconImage,.isTechComponent #componentModIcon,.isTech .tier_bg"),
      gradient("hud_quickbuy_entry.css", ".QuickbuyItem.IsBeingDragged.isTech")
    ]
  },
  {
    id: "laneYellow",
    category: "map",
    label: "Yellow lane",
    description: "Lane 1 swaps, yellow zipline, and unsecured alert cues.",
    defaultColor: "#F0E442",
    defaultWash: 100,
    targets: [
      wash("citadel_hud_top_bar.css", "CitadelHudTopBarPlayer.LaneSwapDefault.LaneNum1 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapRequesting.LaneNum1 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapReceiving.LaneNum1 #LaneSwapContainer"),
      wash("hud_minimap.css", ".ziplineYellowLane"),
      wash("hud_minimap.css", ".map_button.friend.boss.yellowLane .boss_image"),
      text("hud_gold_and_ap_container.css", "#hudUnsecuredLabel"),
      text("citadel_hud_hero_shop.css", ".isEnemyPurchase Label.recentTimePurchased")
    ]
  },
  {
    id: "laneGreen",
    category: "map",
    label: "Green lane",
    description: "Lane 3 swaps and green lane minimap marks.",
    defaultColor: "#009E73",
    defaultWash: 100,
    targets: [
      wash("citadel_hud_top_bar.css", "CitadelHudTopBarPlayer.LaneSwapDefault.LaneNum3 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapRequesting.LaneNum3 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapReceiving.LaneNum3 #LaneSwapContainer"),
      wash("hud_minimap.css", ".ziplineGreenLane"),
      wash("hud_minimap.css", ".map_button.friend.boss.greenLane .boss_image"),
      gradient("hud_quickbuy_entry.css", ".QuickbuyItem.IsBeingDragged.isArmor")
    ]
  },
  {
    id: "laneBlue",
    category: "map",
    label: "Blue lane",
    description: "Lane 4 swaps and blue lane minimap marks.",
    defaultColor: "#56B4E9",
    defaultWash: 100,
    targets: [
      wash("citadel_hud_top_bar.css", "CitadelHudTopBarPlayer.LaneSwapDefault.LaneNum4 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapRequesting.LaneNum4 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapReceiving.LaneNum4 #LaneSwapContainer"),
      wash("hud_minimap.css", ".ziplineBlueLane"),
      wash("hud_minimap.css", ".map_button.friend.boss.blueLane .boss_image")
    ]
  },
  {
    id: "lanePurple",
    category: "map",
    label: "Purple lane",
    description: "Lane 6 swaps, purple lane minimap marks, and recommended overlays.",
    defaultColor: "#CC79A7",
    defaultWash: 100,
    targets: [
      wash("citadel_hud_top_bar.css", "CitadelHudTopBarPlayer.LaneSwapDefault.LaneNum6 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapRequesting.LaneNum6 #LaneSwapContainer,CitadelHudTopBarPlayer.LaneSwapReceiving.LaneNum6 #LaneSwapContainer"),
      wash("hud_minimap.css", ".ziplinePurpleLane"),
      wash("hud_minimap.css", ".map_button.friend.boss.purpleLane .boss_image")
    ]
  },
  {
    id: "border",
    category: "combat",
    label: "Dark edge",
    description: "Health borders, locked overlays, cooldown masks, and disabled panels.",
    defaultColor: "#111827",
    defaultWash: 100,
    targets: [
      wash("unit_status.css", ".enemy .healthbar_border"),
      bg("citadel_hud_hero_shop.css", "#APCurrencyContainer,.hasAbilityUpgradeAvailable #APCurrencyContainer,.hasAbilityUnlockAvailable #APCurrencyContainer", 80),
      bg("citadel_hud_top_bar.css", ".LockedOverlay", 80),
      bg("citadel_hud_shop_quickbuy.css", ".shopClosed CitadelHudQuickBuy,.shopClosed CitadelHudQuickBuy:hover", 65),
      bg("citadel_shop_mod_icon.css", "#CooldownMask", 90),
      bg("citadel_shop_mod_icon.css", "CitadelHudQuickbuy .isWeapon.VerticalCooldown #CooldownMask,CitadelHudQuickbuy .isArmor.VerticalCooldown #CooldownMask,CitadelHudQuickbuy .isTech.VerticalCooldown #CooldownMask", 85),
      bg("citadel_shop_mod_view.css", "#CitadelHudHeroShop CitadelShopMod.owned #CardBacker,#CitadelHudHeroShop CitadelShopMod.usedAsComponent #CardBacker", 100),
      bg("hud_gold_and_ap_container.css", ".death_penalty_gold_danger_level_2 .hudDeathGoldContainer,.death_penalty_gold_danger_level_3 .hudDeathGoldContainer,.death_penalty_gold_danger_level_4 .hudDeathGoldContainer", 80),
      bg("hud_quickbuy.css", ".purchasingDisabled #HudMini", 65),
      bg("hud_quickbuy.css", "#QuickbuyShopSummary", 85),
      bg("ability_hud_elements/element_sprint.css", "#circular_progress_backer", 80),
      wash("hud_ability_icon.css", ".cooling_down .ability_ring,.ability_not_ready .ability_ring", 90),
      wash("hud_abilities.css", ".cooling_down .ability_ring,.ability_not_ready .ability_ring", 90),
      text("hud_damage_impact.css", ".playerName")
    ]
  },
  {
    id: "disabled",
    category: "system",
    label: "Disabled wash",
    description: "Cooldown, locked, not trained, disabled purchase, and drag outside states.",
    defaultColor: "#6B7280",
    defaultWash: 100,
    targets: [
      wash("hud_abilities.css", ".cooling_down .ability_bg,.ability_not_ready .ability_bg,.not_trained .image_container", 85),
      wash("hud_abilities.css", ".not_enough_mana .button_container"),
      wash("hud_ability_icon.css", ".cooling_down .ability_bg,.cooling_down #SubAbility,.ability_not_ready .ability_bg,.ability_not_ready #SubAbility", 85),
      bg("hud_ability_icon.css", "CitadelHudTopBarPlayer CitadelAbilityIcon.cooling_down"),
      wash("hud_ability_icon_active.css", "DraggableAbilityIcon.disabled", 85),
      wash("hud_ability_icon_active.css", ".cooling_down .ability_bg,.ability_not_ready .ability_bg", 85),
      wash("hud_ability_icon_active.css", ".not_enough_mana .button_container"),
      wash("hud_ability_icon_passive.css", ".cooling_down .ability_bg,.ability_not_ready .ability_bg,.not_trained .image_container", 85),
      wash("citadel_hud_hero_shop.css", ".UnavailableLabel,.mod_universal_locked"),
      bg("citadel_shop_mod_icon.css", ".Locked .mod_icon_single_container,.unowned.mod_icon_single_container,#StatsAndModsContainer .unowned.mod_icon_single_container", 85),
      wash("citadel_shop_mod_icon.css", ".Locked .mod_icon_single_container,.unowned.mod_icon_single_container,#StatsAndModsContainer .unowned.mod_icon_single_container", 85),
      wash("citadel_shop_mod_view.css", "CitadelShopMod", 70),
      wash("citadel_shop_mod_view.css", "CitadelShopMod.itemDisabled,CitadelShopMod.disabledFromPurchasing,.RestrictedItems CitadelShopMod:not(.AllowedInRestrictedShop)", 85),
      wash("hud_quickbuy_entry.css", ".DraggingOutside .QuickbuyItem.IsDragSource")
    ]
  },
  {
    id: "disabledText",
    category: "system",
    label: "Muted text",
    description: "Unavailable text and quiet readouts.",
    defaultColor: "#9CA3AF",
    defaultWash: 100,
    targets: [
      text("citadel_hud_hero_shop.css", ".UnavailableLabel,.mod_universal_locked"),
      text("citadel_shop_mod_view.css", ".ItemDisabledLabel,.itemDisabled .modName,.disabledFromPurchasing .modName")
    ]
  },
  {
    id: "friendBorder",
    category: "team",
    label: "Friendly border",
    description: "Light borders and top bar ability fallback.",
    defaultColor: "#DDE7EE",
    defaultWash: 100,
    targets: [
      wash("unit_status.css", ".friend .healthbar_border"),
      bg("hud_ability_icon.css", "CitadelHudTopBarPlayer CitadelAbilityIcon")
    ]
  }
];

export const EFFECT_TARGETS = [
  opacity("hud_abilities.css", ".cooling_down .ability_bg,.ability_not_ready .ability_bg,.not_trained .image_container", 0.35),
  opacity("hud_ability_icon.css", ".cooling_down .ability_bg,.cooling_down #SubAbility,.ability_not_ready .ability_bg,.ability_not_ready #SubAbility", 0.25),
  opacity("hud_ability_icon.css", ".cooling_down .ability_ring,.ability_not_ready .ability_ring", 0.75),
  opacity("hud_ability_icon_active.css", "DraggableAbilityIcon.disabled", 0.7),
  opacity("hud_ability_icon_active.css", ".cooling_down .ability_bg,.ability_not_ready .ability_bg", 0.25),
  opacity("hud_ability_icon_passive.css", ".cooling_down .ability_bg,.ability_not_ready .ability_bg,.not_trained .image_container", 0.35),
  opacity("citadel_shop_mod_icon.css", ".Locked .mod_icon_single_container,.unowned.mod_icon_single_container,#StatsAndModsContainer .unowned.mod_icon_single_container", 0.75),
  opacity("citadel_shop_mod_view.css", "CitadelShopMod.canAffordMod,CitadelShopMod.canAffordMod:hover", 1),
  brightness("citadel_shop_mod_view.css", "CitadelShopMod.canAffordMod,CitadelShopMod.canAffordMod:hover", 1),
  opacity("citadel_shop_mod_view.css", "CitadelShopMod.owned,CitadelShopMod.usedAsComponent", 0.85),
  brightness("citadel_shop_mod_view.css", "CitadelShopMod.owned,CitadelShopMod.usedAsComponent", 1),
  opacity("citadel_shop_mod_view.css", "CitadelShopMod.itemDisabled,CitadelShopMod.disabledFromPurchasing,.RestrictedItems CitadelShopMod:not(.AllowedInRestrictedShop)", 0.25),
  saturation("citadel_shop_mod_view.css", "CitadelShopMod.itemDisabled,CitadelShopMod.disabledFromPurchasing,.RestrictedItems CitadelShopMod:not(.AllowedInRestrictedShop)", 0),
  opacity("citadel_shop_mod_view.css", ".quickbuy .quickbuy_icon", 1),
  opacity("citadel_shop_mod_view.css", ".recommended .recommended_icon", 1),
  opacity("hud_quickbuy_entry.css", ".QuickbuyItem.CanAffordCumulative", 1),
  opacity("hud_quickbuy_entry.css", ".QuickbuyItem.CanAffordCumulative.exceedsItemSlot", 0.45),
  opacity("hud_objective_health.css", ".on_damaged #healthbar_progress .ProgressBarMiddle", 1),
  fixed("citadel_shop_mod_view.css", SHOP_READABLE_ITEM_TEXT_SELECTOR, "color", "#F8FAFC"),
  fixed("citadel_shop_mod_view.css", SHOP_READABLE_ITEM_TEXT_SELECTOR, "text-shadow", "0px 0px 5.0 #000000"),
  fixed("citadel_shop_mod_view.css", SHOP_READABLE_TIER_SELECTOR, "wash-color", "#F8FAFC")
];

export const PRESETS = [
  {
    id: "legacy-okabe",
    label: "Legacy Okabe-Ito",
    description: "Matches the current old_color_blind palette as the safe baseline.",
    globalWash: 100,
    backgroundWash: 100,
    colors: {}
  },
  {
    id: "deutan-amber-blue",
    label: "Deutan amber / blue",
    description: "Separates enemy as amber and friend as saturated blue with restrained purple upgrade cues.",
    globalWash: 92,
    backgroundWash: 88,
    colors: {
      enemy: "#F2B84B",
      enemyDelta: "#E0692F",
      friend: "#2388D1",
      friendAccent: "#7BC7FF",
      positive: "#19A974",
      upgrade: "#B76BD8",
      economy: "#E9A441",
      tech: "#2388D1",
      border: "#18212F"
    }
  },
  {
    id: "protan-cyan-gold",
    label: "Protanopia preset",
    description: "Preset colors tuned away from red dependence, using cyan friend cues and gold hostile cues.",
    globalWash: 96,
    backgroundWash: 90,
    colors: {
      enemy: "#FFD45A",
      enemyDelta: "#FF8C42",
      friend: "#2BB8D8",
      friendAccent: "#86E2F1",
      positive: "#38B67E",
      upgrade: "#D77AD8",
      economy: "#E6A33A",
      tech: "#2BB8D8",
      lanePurple: "#C985D9",
      border: "#111B26"
    }
  },
  {
    id: "tritan-rose-lime",
    label: "Tritanopia preset",
    description: "Preset colors tuned away from blue-yellow dependence, using rose and lime team separation.",
    globalWash: 90,
    backgroundWash: 86,
    colors: {
      enemy: "#E56A75",
      enemyDelta: "#C94B4B",
      friend: "#6FBF4A",
      friendAccent: "#9FE36D",
      positive: "#43B172",
      upgrade: "#B983E6",
      economy: "#D99A38",
      tech: "#4EA6A8",
      laneYellow: "#E7C55C",
      laneBlue: "#6CC7CF",
      border: "#181A22"
    }
  },
  {
    id: "high-contrast",
    label: "Strong separation",
    description: "Predefined brighter role colors for visibility; does not analyze or adjust original CSS contrast.",
    globalWash: 100,
    backgroundWash: 96,
    colors: {
      enemy: "#FFD84D",
      enemyDelta: "#FF6A3D",
      friend: "#38BDF8",
      friendAccent: "#8DE1FF",
      positive: "#3DDC97",
      upgrade: "#E879F9",
      economy: "#F7B955",
      tech: "#38BDF8",
      disabled: "#7D8592",
      border: "#0B1220"
    }
  }
];

export function getDefaultRoleValues() {
  return Object.fromEntries(
    COLOR_ROLES.map((role) => [role.id, { color: role.defaultColor, wash: role.defaultWash }])
  );
}
