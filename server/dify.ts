interface DifyWorkflowRequest {
  inputs: {
    hasDiscrepancy: boolean;
    reservedCount: number;
    detectedCount: number;
    bookingName?: string;
  };
  response_mode: string;
  user: string;
}

interface DifyWorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: any;
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

export async function triggerDifyWorkflow(
  hasDiscrepancy: boolean,
  reservedCount: number,
  detectedCount: number,
  bookingName?: string
): Promise<DifyWorkflowResponse> {
  const apiUrl = process.env.DIFY_API_URL;
  const apiKey = process.env.DIFY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("Dify API credentials are not configured");
  }

  const requestBody: DifyWorkflowRequest = {
    inputs: {
      hasDiscrepancy,
      reservedCount,
      detectedCount,
      bookingName,
    },
    response_mode: "blocking",
    user: "minpaku-guard-system",
  };

  try {
    const response = await fetch(`${apiUrl}/workflows/run`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data as DifyWorkflowResponse;
  } catch (error) {
    console.error("Dify workflow trigger error:", error);
    throw new Error(
      "Difyワークフローの呼び出しに失敗しました: " + 
      (error instanceof Error ? error.message : String(error))
    );
  }
}
