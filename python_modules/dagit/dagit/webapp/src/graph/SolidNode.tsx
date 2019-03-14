import * as React from "react";
import gql from "graphql-tag";
import { Colors } from "@blueprintjs/core";
import PipelineColorScale from "./PipelineColorScale";
import {
  SolidNodeFragment,
  SolidNodeFragment_inputs,
  SolidNodeFragment_outputs
} from "./types/SolidNodeFragment";
import { IFullSolidLayout, ILayout } from "./getFullSolidLayout";
import {
  SVGEllipseInRect,
  SVGFlowLayoutRect,
  SVGMonospaceText
} from "./SVGComponents";

interface ISolidNodeProps {
  layout: IFullSolidLayout;
  solid: SolidNodeFragment;
  minified: boolean;
  selected: boolean;
  dim: boolean;
  onClick?: (solid: string) => void;
  onDoubleClick?: (solid: string) => void;
}

export default class SolidNode extends React.Component<ISolidNodeProps> {
  static fragments = {
    SolidNodeFragment: gql`
      fragment SolidNodeFragment on Solid {
        name
        inputs {
          definition {
            name
            type {
              name
            }
          }
          dependsOn {
            definition {
              name
            }
            solid {
              name
            }
          }
        }
        outputs {
          definition {
            name
            type {
              name
            }
            expectations {
              name
              description
            }
          }
        }
      }
    `
  };

  handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.onClick) {
      this.props.onClick(this.props.solid.name);
    }
  };

  handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.onDoubleClick) {
      this.props.onDoubleClick(this.props.solid.name);
    }
  };

  renderIO(
    colorKey: string,
    items: Array<SolidNodeFragment_inputs | SolidNodeFragment_outputs>,
    layout: { [inputName: string]: { layout: ILayout } }
  ) {
    return Object.keys(layout).map((key, i) => {
      const { x, y, width, height } = layout[key].layout;
      const input = items.find(o => o.definition.name === key);
      const showText = width == 0 && !this.props.minified;

      return (
        <g key={i}>
          <SVGFlowLayoutRect
            x={x}
            y={y}
            stroke="#979797"
            strokeWidth={1}
            maxWidth={300}
            fill={PipelineColorScale(colorKey)}
            padding={8}
            spacing={7}
            height={height}
          >
            <SVGEllipseInRect width={14} height={14} />
            {showText && (
              <SVGMonospaceText
                text={`${input!.definition.name}:`}
                fill="#FFF"
                size={14}
              />
            )}
            {showText && (
              <SVGFlowLayoutRect
                rx={4}
                ry={4}
                stroke="#2491eb"
                strokeWidth={1}
                height={27}
                spacing={0}
                padding={4}
                fill="#d6ecff"
              >
                <SVGMonospaceText
                  text={input!.definition.type.name}
                  size={14}
                  fill="#222"
                />
              </SVGFlowLayoutRect>
            )}
          </SVGFlowLayoutRect>
        </g>
      );
    });
  }

  renderSelectedBox() {
    const { x, y, width, height } = this.props.layout.boundingBox;
    return (
      <rect
        x={x - 10}
        y={y - 10}
        width={width + 20}
        height={height + 20}
        stroke={Colors.GRAY3}
        fill="transparent"
        strokeWidth={this.props.minified ? 3 : 1}
        strokeDasharray={this.props.minified ? 12 : 4}
      />
    );
  }

  renderSolid() {
    return (
      <SVGFlowLayoutRect
        {...this.props.layout.solid}
        fill={PipelineColorScale("solid")}
        stroke="#979797"
        strokeWidth={1}
        spacing={0}
        padding={12}
      >
        <SVGMonospaceText
          size={this.props.minified ? 30 : 16}
          text={this.props.solid.name}
          fill={"#222"}
        />
      </SVGFlowLayoutRect>
    );
  }

  public render() {
    const { solid, layout } = this.props;

    return (
      <g
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}
        opacity={this.props.dim ? 0.3 : 1}
      >
        {this.props.selected && this.renderSelectedBox()}
        {this.renderSolid()}
        {this.renderIO("input", solid.inputs, layout.inputs)}
        {this.renderIO("output", solid.outputs, layout.outputs)}
      </g>
    );
  }
}