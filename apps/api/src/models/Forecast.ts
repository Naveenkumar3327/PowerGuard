import mongoose, { Schema, Document } from 'mongoose';

export interface IForecastDocument extends Document {
  horizon: '1h' | '6h' | '24h';
  predictedTotalPowerKw: number;
  predictedPeakKw: number;
  peakTime: string;
  confidence: number;
  dataPoints: {
    time: string;
    actual?: number;
    predicted: number;
    lowerBound: number;
    upperBound: number;
  }[];
  createdAt: Date;
}

const ForecastSchema = new Schema<IForecastDocument>(
  {
    horizon: { type: String, enum: ['1h' , '6h', '24h'], required: true },
    predictedTotalPowerKw: { type: Number, required: true },
    predictedPeakKw: { type: Number, required: true },
    peakTime: { type: String, required: true },
    confidence: { type: Number, required: true },
    dataPoints: [
      {
        time: { type: String, required: true },
        actual: { type: Number },
        predicted: { type: Number, required: true },
        lowerBound: { type: Number, required: true },
        upperBound: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

ForecastSchema.index({ horizon: 1, createdAt: -1 });

export const ForecastModel = mongoose.models.Forecast || mongoose.model<IForecastDocument>('Forecast', ForecastSchema);
