load("github.com/SonarSource/cirrus-modules@v3", "load_features")
load("cirrus", "env", "fs", "yaml")

# TODO Will need to change to match https://github.com/SonarSource/sonar-enterprise/blob/master/.cirrus.star once we have the public mirror
def main(ctx):
    features = yaml.dumps(load_features(ctx, only_if=dict()))
    doc = fs.read("private/.cirrus.yaml")
    return features + doc
