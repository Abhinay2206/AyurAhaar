import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Circle, Ellipse, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

export interface BodyPart {
  show: boolean;
  selected?: boolean;
  color?: string;
  opacity?: number;
}

export interface BodyPartsInput {
  head?: BodyPart;
  left_shoulder?: BodyPart;
  right_shoulder?: BodyPart;
  left_arm?: BodyPart;
  right_arm?: BodyPart;
  left_hand?: BodyPart;
  right_hand?: BodyPart;
  chest?: BodyPart;
  stomach?: BodyPart;
  left_leg?: BodyPart;
  right_leg?: BodyPart;
  left_foot?: BodyPart;
  right_foot?: BodyPart;
  neck?: BodyPart;
  eyes?: BodyPart;
  throat?: BodyPart;
  liver?: BodyPart;
  intestines?: BodyPart;
  pelvis?: BodyPart;
  joints?: BodyPart;
  skin?: BodyPart;
  heart?: BodyPart;
  lungs?: BodyPart;
  kidneys?: BodyPart;
  spine?: BodyPart;
}

interface BodyComponentProps {
  partsInput: BodyPartsInput;
  onClick?: (bodyPart: string) => void;
  svgWidth?: number;
  svgHeight?: number;
  scale?: number;
}

export const BodyComponent: React.FC<BodyComponentProps> = ({
  partsInput,
  onClick,
  svgWidth = width - 40,
  svgHeight = 600,
  scale = 1,
}) => {
  const getPartStyle = (partName: keyof BodyPartsInput) => {
    const part = partsInput[partName];
    if (!part || !part.show) {
      return {
        fill: 'transparent',
        opacity: 0,
        stroke: 'transparent',
        strokeWidth: 0,
      };
    }

    return {
      fill: part.color || '#E0E0E0',
      opacity: part.opacity || 0.7,
      stroke: part.selected ? '#4A9D6A' : 'transparent',
      strokeWidth: part.selected ? 3 : 0,
    };
  };

  const handlePartClick = (partName: string) => {
    if (onClick) {
      onClick(partName);
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg 
        width={svgWidth * scale} 
        height={svgHeight * scale} 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        <Defs>
          <SvgLinearGradient id="bodyFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F8F9FA" />
            <Stop offset="100%" stopColor="#E9ECEF" />
          </SvgLinearGradient>
        </Defs>

        <G>
          {/* Main body outline */}
          <Path
            d="M200 25
               C215 25, 235 30, 235 55
               C235 75, 230 85, 225 95
               C220 100, 215 105, 210 110
               C230 115, 250 125, 265 140
               C280 155, 290 175, 295 195
               C300 215, 295 235, 290 255
               C285 275, 280 295, 275 315
               C270 335, 265 355, 260 375
               C255 390, 250 400, 245 410
               C240 420, 235 430, 230 445
               C225 460, 220 480, 215 500
               C210 520, 205 540, 200 560
               C195 580, 190 590, 185 595
               L175 595
               C170 590, 165 580, 160 560
               C155 540, 150 520, 145 500
               C140 480, 135 460, 130 445
               C125 430, 120 420, 115 410
               C110 400, 105 390, 100 375
               C95 355, 90 335, 85 315
               C80 295, 75 275, 70 255
               C65 235, 60 215, 65 195
               C70 175, 80 155, 95 140
               C110 125, 130 115, 150 110
               C145 105, 140 100, 135 95
               C130 85, 125 75, 125 55
               C125 30, 145 25, 160 25
               L200 25 Z"
            fill="url(#bodyFill)"
            stroke="#666"
            strokeWidth="1"
          />

          {/* Head */}
          {partsInput.head?.show && (
            <Circle
              cx="180"
              cy="55"
              r="30"
              {...getPartStyle('head')}
              onPress={() => handlePartClick('head')}
            />
          )}

          {/* Eyes */}
          {partsInput.eyes?.show && (
            <G onPress={() => handlePartClick('eyes')}>
              <Circle 
                cx="170" 
                cy="50" 
                r="3" 
                {...getPartStyle('eyes')}
              />
              <Circle 
                cx="190" 
                cy="50" 
                r="3" 
                {...getPartStyle('eyes')}
              />
            </G>
          )}

          {/* Neck/Throat */}
          {(partsInput.neck?.show || partsInput.throat?.show) && (
            <Ellipse
              cx="180"
              cy="95"
              rx="15"
              ry="20"
              {...getPartStyle(partsInput.throat?.show ? 'throat' : 'neck')}
              onPress={() => handlePartClick(partsInput.throat?.show ? 'throat' : 'neck')}
            />
          )}

          {/* Left Shoulder */}
          {partsInput.left_shoulder?.show && (
            <Ellipse
              cx="135"
              cy="125"
              rx="20"
              ry="15"
              {...getPartStyle('left_shoulder')}
              onPress={() => handlePartClick('left_shoulder')}
            />
          )}

          {/* Right Shoulder */}
          {partsInput.right_shoulder?.show && (
            <Ellipse
              cx="225"
              cy="125"
              rx="20"
              ry="15"
              {...getPartStyle('right_shoulder')}
              onPress={() => handlePartClick('right_shoulder')}
            />
          )}

          {/* Chest/Heart/Lungs */}
          {(partsInput.chest?.show || partsInput.heart?.show || partsInput.lungs?.show) && (
            <Ellipse
              cx="180"
              cy="160"
              rx="45"
              ry="40"
              {...getPartStyle(partsInput.chest?.show ? 'chest' : partsInput.heart?.show ? 'heart' : 'lungs')}
              onPress={() => {
                const partName = partsInput.chest?.show ? 'chest' : partsInput.heart?.show ? 'heart' : 'lungs';
                handlePartClick(partName);
              }}
            />
          )}

          {/* Stomach/Liver */}
          {(partsInput.stomach?.show || partsInput.liver?.show) && (
            <Ellipse
              cx="180"
              cy="230"
              rx="35"
              ry="30"
              {...getPartStyle(partsInput.stomach?.show ? 'stomach' : 'liver')}
              onPress={() => {
                const partName = partsInput.stomach?.show ? 'stomach' : 'liver';
                handlePartClick(partName);
              }}
            />
          )}

          {/* Intestines */}
          {partsInput.intestines?.show && (
            <Ellipse
              cx="180"
              cy="295"
              rx="40"
              ry="25"
              {...getPartStyle('intestines')}
              onPress={() => handlePartClick('intestines')}
            />
          )}

          {/* Pelvis */}
          {partsInput.pelvis?.show && (
            <Ellipse
              cx="180"
              cy="355"
              rx="35"
              ry="20"
              {...getPartStyle('pelvis')}
              onPress={() => handlePartClick('pelvis')}
            />
          )}

          {/* Left Arm */}
          {partsInput.left_arm?.show && (
            <G onPress={() => handlePartClick('left_arm')}>
              <Ellipse 
                cx="120" 
                cy="160" 
                rx="10" 
                ry="35" 
                {...getPartStyle('left_arm')}
              />
              <Ellipse 
                cx="105" 
                cy="210" 
                rx="8" 
                ry="30" 
                {...getPartStyle('left_arm')}
              />
            </G>
          )}

          {/* Right Arm */}
          {partsInput.right_arm?.show && (
            <G onPress={() => handlePartClick('right_arm')}>
              <Ellipse 
                cx="240" 
                cy="160" 
                rx="10" 
                ry="35" 
                {...getPartStyle('right_arm')}
              />
              <Ellipse 
                cx="255" 
                cy="210" 
                rx="8" 
                ry="30" 
                {...getPartStyle('right_arm')}
              />
            </G>
          )}

          {/* Left Hand */}
          {partsInput.left_hand?.show && (
            <Circle
              cx="105"
              cy="250"
              r="8"
              {...getPartStyle('left_hand')}
              onPress={() => handlePartClick('left_hand')}
            />
          )}

          {/* Right Hand */}
          {partsInput.right_hand?.show && (
            <Circle
              cx="255"
              cy="250"
              r="8"
              {...getPartStyle('right_hand')}
              onPress={() => handlePartClick('right_hand')}
            />
          )}

          {/* Left Leg */}
          {partsInput.left_leg?.show && (
            <G onPress={() => handlePartClick('left_leg')}>
              <Ellipse 
                cx="160" 
                cy="420" 
                rx="12" 
                ry="40" 
                {...getPartStyle('left_leg')}
              />
              <Ellipse 
                cx="160" 
                cy="480" 
                rx="10" 
                ry="35" 
                {...getPartStyle('left_leg')}
              />
            </G>
          )}

          {/* Right Leg */}
          {partsInput.right_leg?.show && (
            <G onPress={() => handlePartClick('right_leg')}>
              <Ellipse 
                cx="200" 
                cy="420" 
                rx="12" 
                ry="40" 
                {...getPartStyle('right_leg')}
              />
              <Ellipse 
                cx="200" 
                cy="480" 
                rx="10" 
                ry="35" 
                {...getPartStyle('right_leg')}
              />
            </G>
          )}

          {/* Left Foot */}
          {partsInput.left_foot?.show && (
            <Ellipse
              cx="160"
              cy="530"
              rx="12"
              ry="8"
              {...getPartStyle('left_foot')}
              onPress={() => handlePartClick('left_foot')}
            />
          )}

          {/* Right Foot */}
          {partsInput.right_foot?.show && (
            <Ellipse
              cx="200"
              cy="530"
              rx="12"
              ry="8"
              {...getPartStyle('right_foot')}
              onPress={() => handlePartClick('right_foot')}
            />
          )}

          {/* Joints (if enabled, overlay on arms and legs) */}
          {partsInput.joints?.show && (
            <G onPress={() => handlePartClick('joints')}>
              {/* Shoulder joints */}
              <Circle cx="135" cy="125" r="8" {...getPartStyle('joints')} />
              <Circle cx="225" cy="125" r="8" {...getPartStyle('joints')} />
              {/* Elbow joints */}
              <Circle cx="115" cy="185" r="6" {...getPartStyle('joints')} />
              <Circle cx="245" cy="185" r="6" {...getPartStyle('joints')} />
              {/* Hip joints */}
              <Circle cx="160" cy="380" r="8" {...getPartStyle('joints')} />
              <Circle cx="200" cy="380" r="8" {...getPartStyle('joints')} />
              {/* Knee joints */}
              <Circle cx="160" cy="450" r="6" {...getPartStyle('joints')} />
              <Circle cx="200" cy="450" r="6" {...getPartStyle('joints')} />
            </G>
          )}

          {/* Spine */}
          {partsInput.spine?.show && (
            <Path
              d="M180 95 L180 120 L182 150 L180 180 L178 210 L180 240 L182 270 L180 300 L178 330 L180 360"
              stroke={getPartStyle('spine').fill}
              strokeWidth="4"
              fill="none"
              onPress={() => handlePartClick('spine')}
            />
          )}

          {/* Kidneys */}
          {partsInput.kidneys?.show && (
            <G onPress={() => handlePartClick('kidneys')}>
              <Ellipse cx="165" cy="280" rx="8" ry="15" {...getPartStyle('kidneys')} />
              <Ellipse cx="195" cy="280" rx="8" ry="15" {...getPartStyle('kidneys')} />
            </G>
          )}

          {/* Skin (body outline) */}
          {partsInput.skin?.show && (
            <Path
              d="M200 25
                 C215 25, 235 30, 235 55
                 C235 75, 230 85, 225 95
                 C220 100, 215 105, 210 110
                 C230 115, 250 125, 265 140
                 C280 155, 290 175, 295 195
                 C300 215, 295 235, 290 255
                 C285 275, 280 295, 275 315
                 C270 335, 265 355, 260 375
                 C255 390, 250 400, 245 410
                 C240 420, 235 430, 230 445
                 C225 460, 220 480, 215 500
                 C210 520, 205 540, 200 560
                 C195 580, 190 590, 185 595
                 L175 595
                 C170 590, 165 580, 160 560
                 C155 540, 150 520, 145 500
                 C140 480, 135 460, 130 445
                 C125 430, 120 420, 115 410
                 C110 400, 105 390, 100 375
                 C95 355, 90 335, 85 315
                 C80 295, 75 275, 70 255
                 C65 235, 60 215, 65 195
                 C70 175, 80 155, 95 140
                 C110 125, 130 115, 150 110
                 C145 105, 140 100, 135 95
                 C130 85, 125 75, 125 55
                 C125 30, 145 25, 160 25
                 L200 25 Z"
              fill="transparent"
              stroke={getPartStyle('skin').fill}
              strokeWidth={getPartStyle('skin').strokeWidth || 3}
              strokeOpacity={getPartStyle('skin').opacity}
              onPress={() => handlePartClick('skin')}
            />
          )}
        </G>
      </Svg>
    </View>
  );
};

export default BodyComponent;