export interface GumloopStartResponse {
    run_id: string;
    pipeline_id: string;
    state: string;
}

export interface GumloopRunData {
    run_id: string;
    state: 'RUNNING' | 'DONE' | 'FAILED' | 'TERMINATED';
    outputs: {
        [key: string]: any;
    };
    error?: string;
}

export interface GumloopOutputs {
    products?: any[];
    results?: string;
    // Add your specific output node names here
}