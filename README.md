# calculate-a11y-combinations

Calculate a cartesian product of a set of colors and 
check their contrast ratio according to W3C recommendations.

## Getting started

```sh
yarn global add calculate-a11y-combinations
curl https://gist.githubusercontent.com/marionebl/a420cb2991ee656c85ea33fb7dbdb423/raw/1ae7e22b2f97a09a28120ef53ab1c14a09c3b161/color.json > color.json
calculate-a11y-combinations --color-path color.json > colors.csv
```

## Development

```sh
git clone git@github.com:marionebl/calculate-a11y-combinations.git
cd calculate-a11y-combinations
yarn
yarn tsc
```