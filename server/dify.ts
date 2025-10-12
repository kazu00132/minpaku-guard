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

  console.log("[Dify] Calling workflow API:", apiUrl);
  console.log("[Dify] Request body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${apiUrl}/workflows/run`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("[Dify] Response status:", response.status);
    console.log("[Dify] Response body:", responseText);

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    return data as DifyWorkflowResponse;
  } catch (error) {
    console.error("[Dify] Workflow trigger error:", error);
    throw new Error(
      "Difyワークフローの呼び出しに失敗しました: " + 
      (error instanceof Error ? error.message : String(error))
    );
  }
}
