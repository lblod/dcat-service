// Type definitions used in DSP
// Reference: <https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#lower-level-type>

// NOTE (28/11/2025): The "@type" property is not included in the type
// definitions below. In the DSP specification the value for this property is
// fixed per type. These fixed values are filled it when translating an instance
// to JSON.

// NOTE (11/12/2025): The following types use `uri` as property instead of
// `[@]id` as typically used in DSP's type definitions. The `uri` property will
// be assigned to the `@id` field when converting to json-ld messages. We opted
// for this name to avoid confusion of the property with the `mu:uuid` id we
// typically use internally in semantic.works apps.

export type Agreement = {
  uri: string;
  assignee: string;
  assigner: string;
  target: string;
  profile?: string;
  obligation?: Duty[];
  permission?: Permission[];
  prohibition?: Prohibition[];
  timestamp?: string;
};

export type Constraint = {
  leftOperand: string;
  operator: string;
  rightOperand: string;
  and?: Constraint[];
  andSequence?: Constraint[];
  or?: Constraint[];
  xone?: Constraint[];
};

export type Catalog = {
  uri: string;
  catalog?: Catalog[];
  dataset?: Dataset[];
  distribution?: Distribution[];
  service?: DataService[];
};

export type DataAddress = {
  endpointType: string;
  endpoint?: string;
  endpointProperties?: EndpointProperty[];
};

export type Dataset = {
  uri: string;
  distribution: Distribution[]; // TODO: Enforce there is at least one?
  hasPolicy: Offer[]; // TODO: Enforce there is at least one?
};

export type Distribution = {
  uri: string; // NOTE (28/11/2025): Not in the type's table but used in messages
  accessService: DataService;
  format: string;
  hasPolicy?: Offer[];
};

export type DataService = {
  uri: string;
  endpointUrl?: string;
  servesDataset?: Dataset[];
};

export type Duty = Rule;

export type EndpointProperty = {
  name: string;
  value: string;
};

export type MessageOffer = {
  uri: string;
  profile?: string;
  obligation?: Duty[];
  permission?: Permission[];
  prohibition?: Prohibition[];
  target?: string;
};

export type Offer = {
  uri: string;
  profile?: string;
  obligation?: Duty[];
  permission?: Permission[];
  prohibition?: Prohibition[];
};

export type Permission = Rule;

export type Prohibition = Rule;

export type Rule = {
  uri: string;
  action: string;
  constraint?: Constraint[];
};
