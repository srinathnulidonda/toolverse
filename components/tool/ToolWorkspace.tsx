// components/tool/ToolWorkspace.tsx
import type { ComponentType } from "react";
import type { Tool } from "@/lib/tools";
import JsonFormatterWorkspace from "@/features/dev/json-formatter/Workspace";
import QrGeneratorWorkspace from "@/features/social/qr-generator/Workspace";
import Base64Workspace from "@/features/dev/base64-encoder/Workspace";
import UrlEncoderWorkspace from "@/features/dev/url-encoder/Workspace";
import UuidGeneratorWorkspace from "@/features/dev/uuid-generator/Workspace";
import PasswordGeneratorWorkspace from "@/features/dev/password-generator/Workspace";
import RegexTesterWorkspace from "@/features/dev/regex-tester/Workspace";
import JwtDecoderWorkspace from "@/features/dev/jwt-decoder/Workspace";
import HashGeneratorWorkspace from "@/features/dev/hash-generator/Workspace";
import TimestampConverterWorkspace from "@/features/dev/timestamp-converter/Workspace";
import CaseConverterWorkspace from "@/features/dev/case-converter/Workspace";
import SlugGeneratorWorkspace from "@/features/dev/slug-generator/Workspace";
import DiffCheckerWorkspace from "@/features/dev/diff-checker/Workspace";
import RandomStringGeneratorWorkspace from "@/features/dev/random-string-generator/Workspace";
import ColorConverterWorkspace from "@/features/dev/color-converter/Workspace";
import JSONValidatorWorkspace from "@/features/dev/json-validator/Workspace";
import JSONMinifierWorkspace from "@/features/dev/json-minifier/Workspace";
import HTMLFormatterWorkspace from "@/features/dev/html-formatter/Workspace";
import CSSMinifierWorkspace from "@/features/dev/css-minifier/Workspace";
import JSMinifierWorkspace from "@/features/dev/js-minifier/Workspace";

type ToolWorkspaceProps = {
  tool: Tool;
};

const WORKSPACES: Record<string, ComponentType<{ tool: Tool }>> = {
  // Existing tools
  "json-formatter": JsonFormatterWorkspace,
  "qr-generator": QrGeneratorWorkspace,
  "base64": Base64Workspace,
  "url-encoder": UrlEncoderWorkspace,
  "uuid-generator": UuidGeneratorWorkspace,
  "password-generator": PasswordGeneratorWorkspace,

  // Developer tools
  "regex-tester": RegexTesterWorkspace,
  "jwt-decoder": JwtDecoderWorkspace,
  "hash-generator": HashGeneratorWorkspace,
  "timestamp-converter": TimestampConverterWorkspace,
  "case-converter": CaseConverterWorkspace,
  "slug-generator": SlugGeneratorWorkspace,
  "diff-checker": DiffCheckerWorkspace,
  "random-string-generator": RandomStringGeneratorWorkspace,
  "color-converter": ColorConverterWorkspace,
  "json-validator": JSONValidatorWorkspace,
  "json-minifier": JSONMinifierWorkspace,
  "html-formatter": HTMLFormatterWorkspace,
  "css-minifier": CSSMinifierWorkspace,
  "js-minifier": JSMinifierWorkspace,
};

export default function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  const Workspace = WORKSPACES[tool.slug];
  if (Workspace) {
    return <Workspace tool={tool} />;
  }
  return (
    <>
      <div className="tw-root">
        <div className="tw-placeholder">
          <div className="tw-icon">
            <i className={`ti ${tool.icon}`} aria-hidden="true" />
          </div>
          <p className="tw-title">{tool.label}</p>
          <p className="tw-desc">
            Tool interface coming soon. This is where the{" "}
            {tool.label.toLowerCase()} tool will live.
          </p>
        </div>
      </div>

      <style>{`
                .tw-root {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-xl);
                    min-height: 480px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tw-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 48px 32px;
                    gap: 12px;
                }

                .tw-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }

                .tw-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text);
                    font-family: var(--font-sans);
                    margin: 0;
                    letter-spacing: -0.3px;
                }

                .tw-desc {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-family: var(--font-sans);
                    margin: 0;
                    line-height: 1.6;
                    max-width: 320px;
                }

                @media (max-width: 768px) {
                    .tw-root {
                        min-height: 360px;
                    }
                }
            `}</style>
    </>
  );
}