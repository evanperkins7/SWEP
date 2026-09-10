import { avatarOptions, normalizeAvatar } from "./avatar";
import type { Avatar } from "./avatar";
export function PixelAvatar({
  avatar,
  seated = false,
  label,
}: {
  avatar?: Avatar;
  seated?: boolean;
  label: string;
}) {
  const a = normalizeAvatar(avatar);
  return (
    <svg
      className={`pixel-character ${seated ? "seated" : ""}`}
      viewBox="0 0 48 64"
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <ellipse cx="24" cy="61" rx="17" ry="2" fill="#334a3420" />
      {seated && (
        <>
          <path fill="#887756" d="M9 31h30v23H9zM11 54h4v8h-4zm22 0h4v8h-4z" />
          <path fill="#b4a07a" d="M12 34h24v16H12z" />
        </>
      )}
      {(a.hairStyle === "long" || a.hairStyle === "bob") && (
        <path
          fill={a.hairColor}
          d={a.hairStyle === "long" ? "M10 12h28v29H10z" : "M9 12h30v20H9z"}
        />
      )}
      <path
        fill={a.pantsColor}
        d={
          seated
            ? "M12 44h24v10H12zm0 10h9v5h-9zm15 0h9v5h-9z"
            : "M15 44h18v7H15zm0 7h7v9h-7zm11 0h7v9h-7z"
        }
      />
      <path
        fill="#373c38"
        d={
          seated
            ? "M9 58h12v4H9zm18 0h12v4H27z"
            : "M12 58h10v4H12zm14 0h10v4H26z"
        }
      />
      <path fill={a.shirtColor} d="M15 32h18v3h5v12H10V35h5z" />
      <path fill="#000" opacity=".09" d="M15 43h18v4H15z" />
      <path fill={a.skin} d="M20 27h8v8h-8zM9 44h6v7H9zm24 0h6v7h-6z" />
      {a.outfit === "hoodie" && (
        <>
          <path
            fill="#fff"
            opacity=".4"
            d="M17 33h3v4h-3zm11 0h3v4h-3zM19 40h1v4h-1zm9 0h1v4h-1z"
          />
          <path fill="#000" opacity=".15" d="M20 43h8v3h-8z" />
        </>
      )}
      {a.outfit === "overalls" && (
        <path fill={a.pantsColor} d="M17 33h3v7h8v-7h3v14H17z" />
      )}
      <path
        fill={a.skin}
        d="M15 9h18v4h3v12h-3v4H15v-4h-3V13h3zM10 17h3v6h-3zm26 0h3v6h-3z"
      />
      <path fill="#fff8ed" d="M16 18h6v4h-6zm10 0h6v4h-6z" />
      <path fill={a.eyeColor} d="M18 18h3v4h-3zm9 0h3v4h-3z" />
      <path fill="#352e28" d="M19 19h1v2h-1zm9 0h1v2h-1z" />
      <path fill="#a55b4d" opacity=".65" d="M21 25h6v1h-6z" />
      {a.hairStyle === "short" && (
        <path fill={a.hairColor} d="M13 7h20v3h3v7h-5v-5H20v3h-7z" />
      )}
      {(a.hairStyle === "bob" || a.hairStyle === "long") && (
        <path fill={a.hairColor} d="M13 6h20v3h4v9h-6v-6H19v4h-8V9h2z" />
      )}
      {a.hairStyle === "curly" && (
        <path
          fill={a.hairColor}
          d="M12 5h6v-2h7v2h7v2h5v6h3v6h-6v-5h-5v-3h-6v3h-6v4h-6v-5H8V8h4z"
        />
      )}
      {a.hairStyle === "bun" && (
        <path
          fill={a.hairColor}
          d="M19 1h11v6H19zM13 7h20v3h4v8h-5v-6H17v5h-5V10h1z"
        />
      )}
    </svg>
  );
}
function ColorOptions({
  label,
  field,
  value,
  onChange,
}: {
  label: string;
  field: "skin" | "hairColor" | "eyeColor" | "shirtColor" | "pantsColor";
  value: Avatar;
  onChange: (avatar: Avatar) => void;
}) {
  return (
    <fieldset className="avatar-color-options">
      <legend>{label}</legend>
      <div className="color-options">
        {avatarOptions[field].map((option) => (
          <label
            key={option.value}
            title={option.label}
            className="color-option"
          >
            <input
              type="radio"
              name={`avatar-${field}`}
              aria-label={`${label}: ${option.label}`}
              value={option.value}
              checked={value[field] === option.value}
              onChange={() => onChange({ ...value, [field]: option.value })}
            />
            <span style={{ background: option.value }} aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function AvatarBuilder({
  value,
  onChange,
}: {
  value: Avatar;
  onChange: (avatar: Avatar) => void;
}) {
  return (
    <section className="avatar-builder" aria-labelledby="avatar-builder-title">
      <div className="avatar-builder-heading">
        <span className="eyebrow">CHARACTER SELECT</span>
        <h3 id="avatar-builder-title">Make yourself at home.</h3>
        <p>Build a little you so your TA knows who to look for.</p>
      </div>
      <div className="avatar-editor">
        <div className="character-preview">
          <span className="pixel-sparkle" aria-hidden="true">
            ✦
          </span>
          <PixelAvatar avatar={value} label="Your character preview" />
          <span>YOUR CHARACTER</span>
        </div>
        <div className="avatar-selects">
          <label>
            Gender <span className="optional">(optional)</span>
            <select
              value={value.gender}
              onChange={(e) =>
                onChange({
                  ...value,
                  gender: e.target.value as Avatar["gender"],
                })
              }
            >
              {avatarOptions.gender.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hair style
            <select
              value={value.hairStyle}
              onChange={(e) =>
                onChange({
                  ...value,
                  hairStyle: e.target.value as Avatar["hairStyle"],
                })
              }
            >
              {avatarOptions.hairStyle.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Clothes
            <select
              value={value.outfit}
              onChange={(e) =>
                onChange({
                  ...value,
                  outfit: e.target.value as Avatar["outfit"],
                })
              }
            >
              {avatarOptions.outfit.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="avatar-palette">
        <ColorOptions
          label="Skin tone"
          field="skin"
          value={value}
          onChange={onChange}
        />
        <ColorOptions
          label="Hair color"
          field="hairColor"
          value={value}
          onChange={onChange}
        />
        <ColorOptions
          label="Eye color"
          field="eyeColor"
          value={value}
          onChange={onChange}
        />
        <ColorOptions
          label="Clothing color"
          field="shirtColor"
          value={value}
          onChange={onChange}
        />
        <ColorOptions
          label="Pants color"
          field="pantsColor"
          value={value}
          onChange={onChange}
        />
      </div>
      <p className="avatar-hint">
        Every hairstyle and outfit is available to everyone.
      </p>
    </section>
  );
}
