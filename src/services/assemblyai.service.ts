import { AssemblyAI } from 'assemblyai';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

export interface TranscriptResult {
  text: string;
  words: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  sentences: Array<{
    text: string;
    start: number;
    end: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
  keyPhrases?: string[];
}

export interface ClipCandidate {
  start_time: number;
  end_time: number;
  score: number;
  transcript: string;
  sentiment: string;
  key_moments: string;
  reason: string;
}

export class AssemblyAIService {
  /**
   * Transcribe and analyze audio file
   */
  async transcribeAudio(audioFilePath: string): Promise<TranscriptResult> {
    try {
      console.log('[AssemblyAI] Starting transcription for:', audioFilePath);

      const transcript = await client.transcripts.transcribe({
        audio: audioFilePath,
        speaker_labels: true,
        sentiment_analysis: true,
        auto_highlights: true,
        entity_detection: true,
      });

      if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      console.log('[AssemblyAI] Transcription completed successfully');

      // Extract key phrases from auto highlights
      const keyPhrases = transcript.auto_highlights_result?.results
        ?.map((highlight) => highlight.text)
        .slice(0, 10) || [];

      // Process sentences with sentiment
      const sentences = transcript.sentiment_analysis_results?.map((sent) => ({
        text: sent.text,
        start: sent.start,
        end: sent.end,
        sentiment: sent.sentiment as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
      })) || [];

      // Process words with timestamps
      const words = transcript.words?.map((word) => ({
        text: word.text,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
      })) || [];

      return {
        text: transcript.text || '',
        words,
        sentences,
        keyPhrases,
      };
    } catch (error) {
      console.error('[AssemblyAI] Transcription error:', error);
      throw error;
    }
  }

  /**
   * Detect interesting clips from transcript
   */
  detectClips(transcript: TranscriptResult, minClipDuration: number = 15, maxClipDuration: number = 60): ClipCandidate[] {
    const clips: ClipCandidate[] = [];

    // Group sentences into potential clips
    const { sentences } = transcript;

    if (!sentences || sentences.length === 0) {
      console.log('[AssemblyAI] No sentences found for clip detection');
      return clips;
    }

    let clipStart = sentences[0].start;
    let clipEnd = sentences[0].end;
    let clipText: string[] = [sentences[0].text];
    let clipSentiments: string[] = [sentences[0].sentiment];

    for (let i = 1; i < sentences.length; i++) {
      const sentence = sentences[i];
      const duration = (sentence.end - clipStart) / 1000; // Convert to seconds

      // If duration is within max, continue building clip
      if (duration <= maxClipDuration) {
        clipEnd = sentence.end;
        clipText.push(sentence.text);
        clipSentiments.push(sentence.sentiment);
      } else {
        // Save current clip if it meets minimum duration
        const clipDuration = (clipEnd - clipStart) / 1000;
        if (clipDuration >= minClipDuration) {
          clips.push(this.createClipCandidate(
            clipStart,
            clipEnd,
            clipText,
            clipSentiments
          ));
        }

        // Start new clip
        clipStart = sentence.start;
        clipEnd = sentence.end;
        clipText = [sentence.text];
        clipSentiments = [sentence.sentiment];
      }
    }

    // Add the last clip if valid
    const finalDuration = (clipEnd - clipStart) / 1000;
    if (finalDuration >= minClipDuration) {
      clips.push(this.createClipCandidate(
        clipStart,
        clipEnd,
        clipText,
        clipSentiments
      ));
    }

    // Sort clips by score (higher is better)
    clips.sort((a, b) => b.score - a.score);

    console.log(`[AssemblyAI] Detected ${clips.length} potential clips`);

    return clips.slice(0, 10); // Return top 10 clips
  }

  /**
   * Create a clip candidate with scoring
   */
  private createClipCandidate(
    startMs: number,
    endMs: number,
    texts: string[],
    sentiments: string[]
  ): ClipCandidate {
    const transcript = texts.join(' ');
    const duration = (endMs - startMs) / 1000;

    // Calculate sentiment score
    const posCount = sentiments.filter(s => s === 'POSITIVE').length;
    const negCount = sentiments.filter(s => s === 'NEGATIVE').length;
    const neuCount = sentiments.filter(s => s === 'NEUTRAL').length;

    const totalSentiments = sentiments.length;
    const sentimentScore = totalSentiments > 0
      ? (posCount * 1.0 + neuCount * 0.5 + negCount * 0.3) / totalSentiments
      : 0.5;

    // Dominant sentiment
    let dominantSentiment = 'NEUTRAL';
    if (posCount > negCount && posCount > neuCount) {
      dominantSentiment = 'POSITIVE';
    } else if (negCount > posCount && negCount > neuCount) {
      dominantSentiment = 'NEGATIVE';
    }

    // Calculate engagement score based on:
    // - Length (prefer 30-45 seconds)
    const lengthScore = duration >= 30 && duration <= 45 ? 1.0 : 0.7;

    // - Word density (words per second)
    const wordCount = transcript.split(' ').length;
    const wordsPerSecond = wordCount / duration;
    const densityScore = wordsPerSecond >= 2 && wordsPerSecond <= 4 ? 1.0 : 0.7;

    // Final score (0-1)
    const score = (sentimentScore * 0.4 + lengthScore * 0.3 + densityScore * 0.3);

    // Determine reason for selection
    let reason = 'General content';
    if (posCount > totalSentiments * 0.6) {
      reason = 'High positive sentiment';
    } else if (negCount > totalSentiments * 0.4) {
      reason = 'Strong emotional content';
    } else if (duration >= 30 && duration <= 45) {
      reason = 'Optimal length for short';
    }

    return {
      start_time: Math.floor(startMs / 1000),
      end_time: Math.ceil(endMs / 1000),
      score: Math.round(score * 100) / 100,
      transcript,
      sentiment: dominantSentiment,
      key_moments: texts.slice(0, 3).join('. '),
      reason,
    };
  }
}

export default new AssemblyAIService();
