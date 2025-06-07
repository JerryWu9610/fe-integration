export type LogUpdateCallback = (message: string) => Promise<void>;

export type StepHandlerParams = {
  product: string;
  procedureId: string;
  stepParams: Record<string, any>;
};

export type ExecuteParams = {
  procedureId: string;
  product: string;
  stepParams: Record<string, any>;
};

export type StepHandler = (params: StepHandlerParams) => Promise<void>;
