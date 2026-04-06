/**
 * Carbon Emission types
 */
declare namespace Api {
  namespace CarbonEmission {
    interface QueryParams {
      nodeId: number;
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      dataTime: string;
    }

    interface Result {
      mediumName: string;
      mediumCode: string;
      value: number;
      yoy: number;
    }

    interface Summary {
      totalCarbon: number;
      totalYOY: number;
      details: Result[];
    }

    interface Trend {
      timeLabel: string;
      value: number;
      yoy: number;
      qoq: number;
    }

    interface Rank {
      nodeName: string;
      totalCarbon: number;
      electric: number;
      water: number;
      gas: number;
      heat: number;
      yoy: number;
    }

    interface UpResponse {
      upData: Summary[];
      down: Rank[];
    }

    interface MiddleResponse {
      data: Trend[];
    }
  }
}