/*
  # Update DermaScan Schema with Comprehensive Skin Metrics

  1. Changes to scan_history table
    - Add detailed skin analysis fields for 15 metrics:
      - skin_type (text)
      - spots_score (numeric 0-100)
      - wrinkles_score (numeric 0-100)
      - texture_score (numeric 0-100)
      - acne_score (numeric 0-100)
      - dark_circles_score (numeric 0-100)
      - redness_score (numeric 0-100)
      - oiliness_score (numeric 0-100)
      - moisture_score (numeric 0-100)
      - pores_score (numeric 0-100)
      - eye_bags_score (numeric 0-100)
      - radiance_score (numeric 0-100)
      - firmness_score (numeric 0-100)
      - droopy_upper_eyelid_score (numeric 0-100)
      - droopy_lower_eyelid_score (numeric 0-100)
    - Add detailed analysis text
    - Add recommendations text

  2. Notes
    - Higher scores indicate more severe concerns (0 = excellent, 100 = severe issue)
    - All existing data preserved with backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scan_history' AND column_name = 'spots_score'
  ) THEN
    ALTER TABLE scan_history
      ADD COLUMN spots_score numeric(5,2) DEFAULT 0,
      ADD COLUMN wrinkles_score numeric(5,2) DEFAULT 0,
      ADD COLUMN texture_score numeric(5,2) DEFAULT 0,
      ADD COLUMN acne_score numeric(5,2) DEFAULT 0,
      ADD COLUMN dark_circles_score numeric(5,2) DEFAULT 0,
      ADD COLUMN redness_score numeric(5,2) DEFAULT 0,
      ADD COLUMN oiliness_score numeric(5,2) DEFAULT 0,
      ADD COLUMN moisture_score numeric(5,2) DEFAULT 0,
      ADD COLUMN pores_score numeric(5,2) DEFAULT 0,
      ADD COLUMN eye_bags_score numeric(5,2) DEFAULT 0,
      ADD COLUMN radiance_score numeric(5,2) DEFAULT 0,
      ADD COLUMN firmness_score numeric(5,2) DEFAULT 0,
      ADD COLUMN droopy_upper_eyelid_score numeric(5,2) DEFAULT 0,
      ADD COLUMN droopy_lower_eyelid_score numeric(5,2) DEFAULT 0,
      ADD COLUMN detailed_analysis text DEFAULT '',
      ADD COLUMN recommendations text DEFAULT '';
  END IF;
END $$;